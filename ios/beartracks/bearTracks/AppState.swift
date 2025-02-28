//
//  AppState.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/7/24.
//

import Combine
import Foundation

class AppState: ObservableObject {
#if targetEnvironment(macCatalyst)
    @Published public var selectedTab: Tab? = .teams
#elseif os(watchOS)
#else
    @Published public var selectedTab: Tab = .teams
#endif
    @Published public var loginRequired: Bool = true
    @Published public var matchJson: [Match] = []
    @Published public var dataEntries: [DataEntry] = []
    @Published public var teamsList: [TeamData] = []
    private var cancellables: Set<AnyCancellable> = []
    
    @Published public var matchJsonStatus: (Bool, Bool) = (false, false)
    @Published public var dataJsonStatus: (Bool, Bool) = (false, false)
    @Published public var teamsLoadStatus: (Bool, Bool, Bool) = (false, false, false)
    
#if !os(watchOS)
    init() {
        $selectedTab
            .receive(on: DispatchQueue.main)
            .sink { _ in }
            .store(in: &cancellables)
    }
#endif
    
    func checkLoginState() {
        guard let url = URL(string: "https://beartracks.io/api/v1/whoami") else {
            self.loginRequired = true
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        let task = sharedSession.dataTask(with: request) { (data, response, error) in
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 200 {
                    DispatchQueue.main.sync {
                        self.loginRequired = false
                    }
                } else {
                    DispatchQueue.main.sync {
                        self.loginRequired = true
                    }
                }
            } else {
                DispatchQueue.main.sync {
                    self.loginRequired = true
                }
            }
        }
        task.resume()
    }
    
    func fetchMatchJson() {
        self.matchJsonStatus = (false, false)
        guard let url = URL(string: "https://beartracks.io/api/v1/events/matches/\(UserDefaults().string(forKey: "season") ?? "2025")/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")/qualification/\(UserDefaults().string(forKey: "teamNumber") ?? "766")") else { return }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(MatchData.self, from: data)
                    DispatchQueue.main.async {
                        self.matchJson = []
                        self.matchJson = result.Schedule
                        self.matchJsonStatus = (true, false)
                    }
                } catch {
                    print("parse error")
                    DispatchQueue.main.async {
                        self.matchJsonStatus = (true, true)
                    }
                }
            } else if let error = error {
                print("fetch error: \(error)")
                DispatchQueue.main.async {
                    self.matchJsonStatus = (true, true)
                }
            }
        }
        .resume()
    }
    
    func fetchDataJson(completionBlock: @escaping ([DataEntry]) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/event/\(UserDefaults().string(forKey: "season") ?? "2025")/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) { (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        DispatchQueue.main.async {
                            self.dataJsonStatus = (true, false)
                        }
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    DispatchQueue.main.async {
                        self.dataJsonStatus = (false, true)
                    }
                    completionBlock([])
                }
            } else if let error = error {
                print("fetch error: \(error)")
                DispatchQueue.main.async {
                    self.dataJsonStatus = (false, true)
                }
                completionBlock([])
            }
        }
        requestTask.resume()
    }
    
    func reloadDataJson() {
        self.fetchDataJson { (output) in
            self.dataEntries = output
        }
    }
    
    func fetchTeamsJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/teams/\(UserDefaults().string(forKey: "season") ?? "2025")/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")") else { return }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    var result = try decoder.decode(TeamData.self, from: data)
                    result.sort {
                        if let mainWeightA = $0.performanceValue(type: 0), let mainWeightB = $1.performanceValue(type: 0) {
                            return mainWeightA > mainWeightB
                        } else {
                            return true
                        }
                    }
                    DispatchQueue.main.async {
                        self.teamsLoadStatus = (self.teamsLoadStatus.0, false, true)
                        self.teamsList = [result]
                    }
                } catch {
                    print("parse error \(error)")
                    DispatchQueue.main.async {
                        self.teamsLoadStatus.1 = true
                    }
                }
            } else if let error = error {
                print("fetch error: \(error)")
                DispatchQueue.main.async {
                    self.teamsLoadStatus.1 = true
                }
            }
        }.resume()
    }
}

struct MatchData: Codable {
    let Schedule: [Match]
}

struct Match: Codable, Identifiable {
    var id = UUID()
    let description: String
    let startTime: String
    let matchNumber: Int
    let field: String
    let tournamentLevel: String
    let teams: [Team]
    
    private enum CodingKeys: String, CodingKey {
        case description, startTime, matchNumber, field, tournamentLevel, teams
    }
}

struct Team: Codable, Identifiable {
    var id = UUID()
    let teamNumber: Int
    let station: String
    let surrogate: Bool
    private enum CodingKeys: String, CodingKey {
        case teamNumber, station, surrogate
    }
}

struct DataEntry: Codable, Identifiable {
    var id = UUID()
    let Brief: BriefData
    
    private enum CodingKeys: String, CodingKey {
        case Brief
    }
}

struct BriefData: Codable, Identifiable {
    let id: Int
    let event: String
    let season: Int
    let team: Int
    let match_num: Int
    let user_id: Int
    let name: String
    let from_team: Int
    let weight: String
}

struct TeamElement: Codable {
    let team: TeamEl
    
    enum CodingKeys: String, CodingKey {
        case team = "Team"
    }
    
    func performanceValue(type: Int) -> Float? {
        let teamWeights = team.weight.components(separatedBy: ",").compactMap({ Float($0) })
        if teamWeights.count > type {
            if teamWeights[type] == .infinity {
                return 0
            } else {
                return teamWeights[type]
            }
        } else {
            return 0
        }
    }
}

struct TeamEl: Codable {
    let id: Int
    let team: Int
    let weight: String
    
    enum CodingKeys: String, CodingKey {
        case id = "id"
        case team = "team"
        case weight = "weight"
    }
}

typealias TeamData = [TeamElement]

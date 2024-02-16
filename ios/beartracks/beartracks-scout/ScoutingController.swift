//
//  ScoutingController.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation
import UIKit

class ScoutingController: ObservableObject {
    // login state
    @Published public var loginRequired: Bool = false
    // tab selection
    @Published public var currentTab: Tab = .start
    // basic meta
    private var eventCode: String = UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR"
    @Published public var matchNumber: String = "--"
    @Published public var teamNumber: String = "--"
    @Published public var matchList: [MatchData] = []
    // match buttons
    @Published public var times: [Double] = [0, 0, 0]
    // match time store
    private var matchTimes: [MatchTime] = []
    // qualitative data store
    @Published public var defense: String = ""
    @Published public var driving: String = ""
    @Published public var overall: String = ""
    @Published public var switches: (Bool, Bool, Bool) = (false, false, false)
    // submit sheet
    @Published public var showSubmitSheet: Bool = false
    @Published public var submitSheetType: SubmitSheetType = .waiting
    private var submitSheetMessage: String = ""
    private var submitSheetDetails: String = ""
    
    // getters
    func getMatchNumber() -> String { return self.matchNumber }
    func getTeamNumber() -> String { return self.teamNumber }
    func getDefenseResponse() -> String { return self.defense }
    func getDrivingResponse() -> String { return self.driving }
    func getOverallResponse() -> String { return self.overall }
    func getMatchTimes() -> [MatchTime] { return self.matchTimes }
    func getSubmitSheetMessage() -> String { return self.submitSheetMessage }
    func getSubmitSheetDetails() -> String { return self.submitSheetDetails }

    // setters
    func setMatchNumber(match: String) { self.matchNumber = match }
    func setTeamNumber(team: String) { self.teamNumber = team }
    func setDefenseResponse(response: String) { self.defense = response }
    func setDrivingResponse(response: String) { self.driving = response }
    func setOverallResponse(response: String) { self.overall = response }
    
    // functional functions
    func advanceToTab(tab: Tab) { currentTab = tab }
    
    func clearSpeaker() {
        if times[0] != 0 || times[1] != 0 || times[2] != 0 {
            matchTimes.append(MatchTime(id: matchTimes.count, score_type: 0, intake: times[0], travel: times[1], outtake: times[2]))
            times = [0, 0, 0]
            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        }
    }
    
    func clearAmplifier() {
        if times[0] != 0 || times[1] != 0 || times[2] != 0 {
            matchTimes.append(MatchTime(id: matchTimes.count, score_type: 1, intake: times[0], travel: times[1], outtake: times[2]))
            times = [0, 0, 0]
            UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
        }
    }
    
    func addEndgameValue(type: Int, value: Double) {
        matchTimes.append(MatchTime(id: matchTimes.count, score_type: type, intake: value, travel: value, outtake: value))
    }
    
    func submitData(completionBlock: @escaping (SubmitSheetType) -> Void) {
        addEndgameValue(type: 2, value: switches.0 ? 1 : 0)
        addEndgameValue(type: 3, value: switches.1 ? 1 : 0)
        addEndgameValue(type: 4, value: switches.2 ? 1 : 0)
        guard let url = URL(string: "https://beartracks.io/api/v1/data/submit") else { return }
        var encodedMatchTimes: String = ""
        do {
            encodedMatchTimes = try String(data: JSONEncoder().encode(matchTimes), encoding: .utf8) ?? ""
        } catch {
            encodedMatchTimes = ""
        }
        let matchData = ScoutingDataExport(season: 2024, event: UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR", match_num: Int(matchNumber) ?? 0, level: "Qualification", team: Int(teamNumber) ?? 0, game: encodedMatchTimes, defend: defense, driving: driving, overall: overall)
        do {
            let jsonData = try JSONEncoder().encode(matchData)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            let requestTask = sharedSession.dataTask(with: request) {
                (data: Data?, response: URLResponse?, error: Error?) in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            completionBlock(.done)
                        } else {
                            completionBlock(.error)
                        }
                    } else {
                        completionBlock(.error)
                    }
                } else {
                    completionBlock(.error)
                }
            }
            requestTask.resume()
        } catch {
            completionBlock(.error)
        }
    }
    
    func getMatches(completionBlock: @escaping ([MatchData]) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/events/matches/\(UserDefaults.standard.string(forKey: "season") ?? "2024")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR")/qualification/true") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(MatchData.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock([result])
                    }
                } catch {
                    completionBlock([])
                }
            } else {
                completionBlock([])
            }
        }
        requestTask.resume()
    }
    
    func resetControllerData() {
        self.matchNumber = "--"
        self.teamNumber = "--"
        self.times = [0, 0, 0]
        self.matchTimes = []
        self.defense = ""
        self.driving = ""
        self.overall = ""
    }
}

enum SubmitSheetType {
    case waiting, done, error
}

struct ScoutingDataExport: Codable {
    let season: Int
    let event: String
    let match_num: Int
    let level: String
    let team: Int
    let game: String
    let defend: String
    let driving: String
    let overall: String
}

struct MatchTime: Codable {
    let id: Int
    let score_type: Int
    let intake: Double
    let travel: Double
    let outtake: Double
}

struct MatchData: Codable {
    let Schedule: [Match]
}

struct Match: Codable {
    let description: String
    let startTime: String
    let matchNumber: Int
    let field: String
    let tournamentLevel: String
    let teams: [Team]
}

struct Team: Codable {
    let teamNumber: Int
    let station: String
    let surrogate: Bool
}

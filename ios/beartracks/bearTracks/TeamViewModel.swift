//
//  TeamViewModel.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation
import SwiftUI

class TeamViewModel: ObservableObject {
    @Published private(set) var teamMatches: [DataEntry]
    @Published private(set) var teamData: [StatboticsTeamData]
    @Published private(set) var maximumValue: Float = 0
    @State private var isShowingSheet = false
    @Published public var targetTeam: String = "-1"
    @Published public var loadComplete: (Bool, Bool) = (false, false)
    
    init(team: String) {
        self.targetTeam = team
        self.teamMatches = []
        self.teamData = []
        self.reload()
    }
    
    func fetchTeamMatchesJson(completionBlock: @escaping ([DataEntry]) -> Void) {
        self.loadComplete.0 = false
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/data/brief/team/\(UserDefaults().string(forKey: "season") ?? "2025")/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")/\(targetTeam)"
            )
        else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            DispatchQueue.main.async {
                self.loadComplete.0 = true
            }
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        result.forEach({ data in
                            let wt =
                            data.Brief.weight.components(separatedBy: ",").compactMap({ Float($0) }).first ?? 0
                            if wt > self.maximumValue {
                                self.maximumValue = wt
                            }
                        })
                        completionBlock(result)
                    }
                } catch {
                    print("parse error \(error)")
                    return
                }
            } else if let error = error {
                print("fetch error: \(error)")
                return
            }
        }
        requestTask.resume()
    }
    
    func fetchStatboticsTeamJson(completionBlock: @escaping (StatboticsTeamData) -> Void) {
        self.loadComplete.1 = false
        guard
            let url = URL(
                string:
                    "https://api.statbotics.io/v3/team_event/\(targetTeam)/\(UserDefaults().string(forKey: "season") ?? "2025")\(UserDefaults().string(forKey: "eventCode")?.lowercased() ?? "TEST")"
            )
        else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = false
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            DispatchQueue.main.async {
                self.loadComplete.1 = true
            }
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(StatboticsTeamData.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock(result)
                    }
                } catch {
                    print("Parse error \(error)")
                    return
                }
            } else if let error = error {
                print("Fetch error: \(error)")
                return
            }
        }
        requestTask.resume()
    }
    
    func reload() {
        self.fetchTeamMatchesJson { (output) in
            self.teamMatches = output
        }
#if !os(watchOS)
        self.fetchStatboticsTeamJson { (output) in
            self.teamData = [output]
        }
#else
        self.loadComplete.1 = true
#endif
    }
}

struct StatboticsTeamData: Codable {
    let team: Int?
    let year: Int?
    let event: String?
    let team_name: String?
    let event_name: String?
    let record: StatboticsTeamDataRecord?
}

struct StatboticsTeamDataRecord: Codable {
    let elim: StatboticsTeamDataRecordEach?
    let qual: StatboticsTeamDataRecordEach?
    let total: StatboticsTeamDataRecordEach?
}

struct StatboticsTeamDataRecordEach: Codable {
    let count, wins, losses, ties, rank, rps: Int?
    let rps_per_match: Double?
}

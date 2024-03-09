//
//  TeamViewModel.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation
import SwiftUI

/// Detailed data about a team
///
/// - From bearTracks
///     - A listing of all matches from a team at an event. The team's performance gets displayed in `TeamView` as a progress bar, indicating the team's performance in any given match compared that of their best match.
/// - From Statbotics
///     - The team's record and ranking point details + rank is fetched and is displayed in the `TeamView` directly above a scrollable view of the team's data.
class TeamViewModel: ObservableObject {
    @Published private(set) var teamMatches: [DataEntry]
    @Published private(set) var teamData: [StatboticsTeamData]
    @Published private(set) var maximumValue: Float = 0
    @Published private(set) var selectedItem: String = "-1"
    @State private var isShowingSheet = false
    @Published public var targetTeam: String = "-1"
    @Published public var loadComplete: (Bool, Bool) = (false, false)
    
    init(team: String) {
        self.targetTeam = team
        self.teamMatches = []
        self.teamData = []
        self.reload()
    }
    
    func setSelectedItem(item: String) {
        selectedItem = item
    }
    
    func getSelectedItem() -> String {
        return selectedItem
    }
    
    func fetchTeamMatchesJson(completionBlock: @escaping ([DataEntry]) -> Void) {
        self.loadComplete.0 = false
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/data/brief/team/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "season") ?? "2024")/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/\(targetTeam)"
            )
        else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            self.loadComplete.0 = true
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
                    "https://api.statbotics.io/v2/team_event/\(targetTeam)/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "season") ?? "2024")\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode")?.lowercased() ?? "cafr")"
            )
        else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = false
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            self.loadComplete.1 = true
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(StatboticsTeamData.self, from: data)
                    DispatchQueue.main.async {
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

/// Statbotics' data model for team data.
///
/// > All properties are optional due to inconsistency from Statbotics services
struct StatboticsTeamData: Codable {
    let team: Int?
    let year: Int?
    let event: String?
    let offseason: Bool?
    let teamName: String?
    let eventName: String?
    let state: String?
    let country: String?
    let district: String?
    let type: Int?
    let week: Int?
    let status: String?
    let firstEvent: Bool?
    let epaStart: Double?
    let epaPrePlayoffs: Double?
    let epaEnd: Double?
    let epaMean: Double?
    let epaMax: Double?
    let epaDiff: Double?
    let autoEpaStart: Double?
    let autoEpaPrePlayoffs: Double?
    let autoEpaEnd: Double?
    let autoEpaMean: Double?
    let autoEpaMax: Double?
    let teleopEpaStart: Double?
    let teleopEpaPrePlayoffs: Double?
    let teleopEpaEnd: Double?
    let teleopEpaMean: Double?
    let teleopEpaMax: Double?
    let endgameEpaStart: Double?
    let endgameEpaPrePlayoffs: Double?
    let endgameEpaEnd: Double?
    let endgameEpaMean: Double?
    let endgameEpaMax: Double?
    let rp1_EpaStart: Double?
    let rp1_EpaEnd: Double?
    let rp1_EpaMean: Double?
    let rp1_EpaMax: Double?
    let rp2_EpaStart: Double?
    let rp2_EpaEnd: Double?
    let rp2_EpaMean: Double?
    let rp2_EpaMax: Double?
    let wins: Int?
    let losses: Int?
    let ties: Int?
    let count: Int?
    let winrate: Double?
    let qualwins: Int?
    let qualLosses: Int?
    let qualTies: Int?
    let qualCount: Int?
    let qualWinrate: Double?
    let rps: Int?
    let rpsPerMatch: Double?
    let rank: Int?
    let numTeams: Int?
}

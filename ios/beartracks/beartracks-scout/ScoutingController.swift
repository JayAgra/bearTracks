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
    @Published public var matchNumber: Int = 0
    @Published public var teamNumber: String = "--"
    @Published public var matchList: [MatchData] = []
    // match buttons
    @Published public var times: [Double] = [0, 0, 0]
    // match time store
    @Published public var matchTimes: [MatchTime] = []
    // qualitative data store
    @Published public var defense: String = "No"
    @Published public var driving: String = ""
    @Published public var overall: String = ""
    @Published public var switches: (Bool, Bool, Bool, Int, Int, Int, Int) = (
        false, false, false, 0, 0, 0, 0
        /*
         1 -
         2 -
         3 -
         4 - algae handled, auto period
         5 - coral handled, auto period
         6 - auto period scores
         7 -
         */
    )
    // submit sheet
    @Published public var showSubmitSheet: Bool = false
    @Published public var submitSheetType: SubmitSheetType = .waiting
    private var submitSheetMessage: String = ""
    private var submitSheetDetails: String = ""
    
    // getters
    func getMatchNumber() -> Int { return self.matchNumber }
    func getTeamNumber() -> String { return self.teamNumber }
    func getDefenseResponse() -> String { return self.defense }
    func getDrivingResponse() -> String { return self.driving }
    func getOverallResponse() -> String { return self.overall }
    func getMatchTimes() -> [MatchTime] { return self.matchTimes }
    func getSubmitSheetMessage() -> String { return self.submitSheetMessage }
    func getSubmitSheetDetails() -> String { return self.submitSheetDetails }
    
    // setters
    func setMatchNumber(match: Int) { self.matchNumber = match }
    func setTeamNumber(team: String) { self.teamNumber = team }
    func setDefenseResponse(response: String) { self.defense = response }
    func setDrivingResponse(response: String) { self.driving = response }
    func setOverallResponse(response: String) { self.overall = response }
    
    // functional functions
    func advanceToTab(tab: Tab) { currentTab = tab }
    
    func clearSpeaker() {
        if times[0] != 0 || times[1] != 0 || times[2] != 0 {
            matchTimes.append(
                MatchTime(score_type: 0, intake: times[0], travel: times[1], outtake: times[2]))
            times = [0, 0, 0]
        }
    }
    
    func clearAmplifier() {
        if times[0] != 0 || times[1] != 0 || times[2] != 0 {
            matchTimes.append(
                MatchTime(score_type: 1, intake: times[0], travel: times[1], outtake: times[2]))
            times = [0, 0, 0]
        }
    }
    
    func clearShuttle() {
        if times[0] != 0 || times[1] != 0 || times[2] != 0 {
            matchTimes.append(
                MatchTime(score_type: 9, intake: times[0], travel: times[1], outtake: times[2]))
            times = [0, 0, 0]
        }
    }
    
    func addEndgameValue(type: Int, value: Double) {
        matchTimes.append(MatchTime(score_type: type, intake: value, travel: value, outtake: value))
    }
    
    func submitData(completionBlock: @escaping ((SubmitSheetType, String)) -> Void) {
        var localTimeCopy = matchTimes;
        localTimeCopy.append(MatchTime(score_type: 2, intake: switches.0 ? 1 : 0, travel: switches.0 ? 1 : 0, outtake: switches.0 ? 1 : 0))
        localTimeCopy.append(MatchTime(score_type: 3, intake: switches.1 ? 1 : 0, travel: switches.1 ? 1 : 0, outtake: switches.1 ? 1 : 0))
        localTimeCopy.append(MatchTime(score_type: 4, intake: switches.2 ? 1 : 0, travel: switches.2 ? 1 : 0, outtake: switches.2 ? 1 : 0))
        localTimeCopy.append(MatchTime(score_type: 5, intake: Double(switches.3), travel: Double(switches.3), outtake: Double(switches.3)))
        localTimeCopy.append(MatchTime(score_type: 6, intake: Double(switches.4), travel: Double(switches.4), outtake: Double(switches.4)))
        localTimeCopy.append(MatchTime(score_type: 7, intake: Double(switches.5), travel: Double(switches.5), outtake: Double(switches.5)))
        localTimeCopy.append(MatchTime(score_type: 8, intake: Double(switches.6), travel: Double(switches.6), outtake: Double(switches.6)))
        guard let url = URL(string: "https://beartracks.io/api/v1/data/submit") else { return }
        var encodedMatchTimes: String = ""
        do {
            encodedMatchTimes = try String(data: JSONEncoder().encode(localTimeCopy), encoding: .utf8) ?? ""
        } catch {
            encodedMatchTimes = ""
        }
        let matchData = ScoutingDataExport(
            season: 2025, event: UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR",
            match_num: matchNumber, level: "Qualification", team: Int(teamNumber) ?? 0,
            game: encodedMatchTimes, defend: defense, driving: driving, overall: overall + "\n\niOS v\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "5")")
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
                            completionBlock((.done, ""))
                        } else {
                            completionBlock((.error, "Response Code \(httpResponse.statusCode)"))
                        }
                    } else {
                        completionBlock((.error, "Client response handling error"))
                    }
                } else {
                    completionBlock((.error, "server response do be nil 😳"))
                }
            }
            requestTask.resume()
        } catch {
            completionBlock((.error, "Client data encoding failure"))
        }
    }
    
    func getMatches(completionBlock: @escaping ([MatchData]) -> Void) {
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/events/matches/\(UserDefaults.standard.string(forKey: "season") ?? "2025")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR")/qualification/true"
            )
        else { return }
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
        self.switches = (false, false, false, 0, 0, 0, 0)
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

struct MatchTime: Codable, Identifiable {
    var id = UUID()
    var score_type: Int
    let intake: Double
    let travel: Double
    let outtake: Double
    
    private enum CodingKeys: String, CodingKey {
        case score_type, intake, travel, outtake
    }
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

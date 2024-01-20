//
//  ScoutingController.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation
import UIKit

class ScoutingController: ObservableObject {
    // tab selection
    @Published public var currentTab: Tab = .start
    // basic meta
    private var eventCode: String = UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR"
    private var matchNumber: String = ""
    private var teamNumber: String = ""
    // match buttons
    @Published private(set) var times: [Double] = [0, 0, 0]
    private var startMillis: [Double] = [0, 0, 0]
    private var buttonPressed: [Bool] = [false, false, false]
    // match time store
    private var matchTimes: [MatchTime] = []
    // qualitative data store
    private var defense: String = ""
    private var driving: String = ""
    private var overall: String = ""
    // submit sheet
    @Published public var showSubmitSheet: Bool = false
    @Published public var submitSheetType: SubmitSheetType = .waiting
    private var submitSheetMessage: String = ""
    private var submitSheetDetails: String = ""
    
    // getters
    
    func getMatchNumber() -> String {
        return self.matchNumber
    }
    
    func getTeamNumber() -> String {
        return self.teamNumber
    }
    
    func getDefenseResponse() -> String {
        return self.defense
    }
    
    func getDrivingResponse() -> String {
        return self.driving
    }
    
    func getOverallResponse() -> String {
        return self.overall
    }
    
    func getMatchTimes() -> [MatchTime] {
        return self.matchTimes
    }
    
    func getSubmitSheetMessage() -> String {
        return self.submitSheetMessage
    }
    
    func getSubmitSheetDetails() -> String {
        return self.submitSheetDetails
    }
    
    // setters
    
    func setMatchNumber(match: String) {
        self.matchNumber = match
    }
    
    func setTeamNumber(team: String) {
        self.teamNumber = team
    }
    
    func setDefenseResponse(response: String) {
        self.defense = response
    }
    
    func setDrivingResponse(response: String) {
        self.driving = response
    }
    
    func setOverallResponse(response: String) {
        self.overall = response
    }
    
    // functional functions
    func advanceToTab(tab: Tab) {
        currentTab = tab
    }
    
    func advanceToGame() {
        if matchNumber != "" && teamNumber != "" && currentTab == .start {
            currentTab = .game
        }
    }
    
    // match buttons
    func beginClick(buttonIndex: Int = 0) {
        if !buttonPressed[buttonIndex] {
            buttonPressed[buttonIndex].toggle()
            startMillis[buttonIndex] = Date().timeIntervalSince1970
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }
    
    func endClick(buttonIndex: Int = 0) {
        if buttonPressed[buttonIndex] {
            buttonPressed[buttonIndex].toggle()
            times[buttonIndex] += Date().timeIntervalSince1970 - startMillis[buttonIndex]
            startMillis[buttonIndex] = 0
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }
    
    func resetItems() {
        times = [0, 0, 0]
        startMillis = [0, 0, 0]
        buttonPressed = [false, false, false]
    }
    
    func clearSpeaker() {
        matchTimes.append(MatchTime(id: matchTimes.count, score_type: 0, intake: times[0], travel: times[1], outtake: times[2]))
        resetItems()
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    }
    
    func clearAmplifier() {
        matchTimes.append(MatchTime(id: matchTimes.count, score_type: 1, intake: times[0], travel: times[1], outtake: times[2]))
        resetItems()
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
    
    func addEndgameValue(type: Int, value: Double) {
        matchTimes.append(MatchTime(id: matchTimes.count, score_type: type, intake: value, travel: value, outtake: value))
    }
    
    func submitData(completionBlock: @escaping (SubmitSheetType) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/submit") else {
            return
        }
        
        var encodedMatchTimes: String = ""
        do {
            encodedMatchTimes = try String(data: JSONEncoder().encode(matchTimes), encoding: .utf8) ?? ""
        } catch {
            print("serialization error")
        }
        let matchData = ScoutingDataExport(season: 2024, event: eventCode, match_num: Int(matchNumber) ?? 0, level: "Qualification", team: Int(teamNumber) ?? 0, game: encodedMatchTimes, defend: defense, driving: driving, overall: overall)

        do {
            let jsonData = try JSONEncoder().encode(matchData)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            let requestTask = sharedSession.dataTask(with: request) {
                (data: Data?, response: URLResponse?, error: Error?) in
                if let data = data {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            completionBlock(.done)
                        } else {
                            print("server non-successful response")
                            completionBlock(.error)
                        }
                    } else {
                        print("parse error")
                        completionBlock(.error)
                    }
                } else {
                    print("fetch error: \(String(describing: error))")
                    completionBlock(.error)
                }
            }
            requestTask.resume()
        } catch {
            completionBlock(.error)
        }
        
    }
    
    func resetControllerData() {
        self.matchNumber = ""
        self.teamNumber = ""
        self.times = [0, 0, 0]
        self.startMillis = [0, 0, 0]
        self.buttonPressed = [false, false, false]
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

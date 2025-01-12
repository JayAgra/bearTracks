//
//  TeamStatController.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/14/24.
//

import Foundation

enum StatType {
  case mean, first, median, third, decay
}

class TeamStatController: ObservableObject {
    @Published public var statType: StatType = .median
    @Published public var teamNumber: String = ""
    @Published public var teamData: [TeamStats] = []
    
    public func fetchTeamDataJson() {
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/game/team_data/2025/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/\(teamNumber)"
            )
        else { return }
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(TeamStats.self, from: data)
                    DispatchQueue.main.async {
                        self.teamData = [result]
                    }
                } catch {
                    print("parse error \(error)")
                }
            } else if let error = error {
                print("fetch error: \(error)")
            }
        }
        .resume()
    }
}

struct TeamStats: Codable {
    let team: Int
    let trap_note, climb, buddy_climb: Double?
    let intake, travel, outtake, speaker, amplifier, total, points, auto_preload, auto_wing,
        auto_center, auto_scores: DataStats
    
    subscript(key: String) -> DataStats {
        get {
            switch key {
            case "Speaker": return self.speaker
            case "Amplifier": return self.amplifier
            case "Intake": return self.intake
            case "Travel": return self.travel
            case "Outtake": return self.outtake
            case "Performance Score": return self.points
            default: return self.points
            }
        }
    }
}

struct DataStats: Codable { let first, median, third, mean, decaying: Int }

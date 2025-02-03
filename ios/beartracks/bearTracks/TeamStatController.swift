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
    let leave, park, shallow_cage, deep_cage: Double?
    let intake_time, travel_time, outtake_time, algae, level_0, level_1, level_2, level_3, score, auto_scores: DataStats
    
    subscript(key: String) -> DataStats {
        get {
            switch key {
            case "Algae": return self.algae
            case "Level 1": return self.level_0
            case "Level 2": return self.level_1
            case "Level 3": return self.level_2
            case "Level 4": return self.level_3
            case "Intake": return self.intake_time
            case "Travel": return self.travel_time
            case "Outtake": return self.outtake_time
            case "Performance Score": return self.score
            default: return self.score
            }
        }
    }
}

struct DataStats: Codable { let first, median, third, mean, decaying: Int }

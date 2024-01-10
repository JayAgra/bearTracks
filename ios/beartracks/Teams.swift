//
//  Teams.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI
import Foundation

struct Teams: View {
    @State private var teamsList: [TeamData] = []
    
    var body: some View {
        VStack {
            Text("Teams")
                .font(.largeTitle)
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            ScrollView {
                LazyVStack {
                    if !teamsList.isEmpty {
                        ForEach(Array(teamsList[0].enumerated()), id: \.element.team.team) { index, team in
                            VStack {
                                HStack {
                                    Text("\(String(index + 1))")
                                        .font(.title)
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("\(String(team.team.team))")
                                        .font(.title)
                                        .padding(.trailing)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                }
                                HStack {
                                    ProgressView(value: (team.firstValue() ?? 0) / (teamsList[0][0].firstValue() ?? 0))
                                }
                            }
                            .padding()
                        }
                    } else {
                        Text("loading teams...")
                            .padding(.bottom)
                    }
                }
            }
        }
        .padding()
        .onAppear() {
            fetchTeamsJson()
        }
    }
    
    func fetchTeamsJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/teams/\(UserDefaults.standard.string(forKey: "season") ?? "2023")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CADA")") else {
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    var result = try decoder.decode(TeamData.self, from: data)
                    result.sort {
                        if let mainWeightA = $0.firstValue(), let mainWeightB = $1.firstValue() {
                            return mainWeightA > mainWeightB
                        } else {
                            return true
                        }
                    }
                    DispatchQueue.main.async {
                        self.teamsList = [result]
                    }
                } catch {
                    print("parse error \(error)")
                }
            } else if let error = error {
                print("fetch error: \(error)")
            }
        }.resume()
    }
}

#Preview {
    Teams()
}

// MARK: - WelcomeElement
struct TeamElement: Codable {
    let team: TeamEl

    enum CodingKeys: String, CodingKey {
        case team = "Team"
    }
    
    func firstValue() -> Float? {
        return team.weight.components(separatedBy: ",").compactMap({ Float($0) }).first
    }
}

// MARK: - Team
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

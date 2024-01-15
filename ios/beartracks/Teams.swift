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
    @State private var showSheet: Bool = false
    @ObservedObject var selectedItemTracker: MatchListModel = MatchListModel()
    
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
                            .onTapGesture {
                                selectedItemTracker.setSelectedItem(item: String(team.team.team))
                                showSheet = true
                            }
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
        .sheet(isPresented: $showSheet, onDismiss: {
            showSheet = false
        }, content: {
            TeamView(team: selectedItemTracker.getSelectedItem())
        })
    }
    
    func fetchTeamsJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/teams/\(UserDefaults.standard.string(forKey: "season") ?? "2024")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR")") else {
            return
        }
        
        sharedSession.dataTask(with: url) { data, _, error in
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

struct TeamElement: Codable {
    let team: TeamEl

    enum CodingKeys: String, CodingKey {
        case team = "Team"
    }
    
    func firstValue() -> Float? {
        return team.weight.components(separatedBy: ",").compactMap({ Float($0) }).first
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

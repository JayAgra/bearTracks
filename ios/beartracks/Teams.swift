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
    @State private var loadFailed: Bool = false
    @State private var loadComplete: Bool = false
    @State private var selectedItem: String = ""
    
    var body: some View {
        VStack {
            NavigationStack {
                if !teamsList.isEmpty && !teamsList[0].isEmpty {
                    List {
                        ForEach(Array(teamsList[0].enumerated()), id: \.element.team.team) { index, team in
                            NavigationLink(value: team.team.team) {
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
                                    .contentShape(Rectangle())
                                    HStack {
                                        ProgressView(value: max(team.firstValue() ?? 0, 0) / max(teamsList[0][0].firstValue() ?? 0, 1))
                                            .padding([.leading, .trailing])
                                    }
                                }
                                .onTapGesture {
                                    selectedItem = String(team.team.team)
                                    showSheet = true
                                }
                                .contentShape(Rectangle())
                            }
                        }
                    }
                    .navigationTitle("Teams")
                    .navigationDestination(isPresented: $showSheet) {
                        TeamView(team: selectedItem)
                            .navigationTitle("team \(selectedItem)")
                    }
                } else {
                    if loadFailed {
                        VStack {
                            Label("failed", systemImage: "xmark.seal.fill")
                                .padding(.bottom)
                                .labelStyle(.iconOnly)
                                .foregroundStyle(Color.pink)
                            Text("load failed")
                                .padding(.bottom)
                        }
                        .navigationTitle("Teams")
                    } else {
                        if loadComplete {
                            VStack {
                                Label("none", systemImage: "questionmark.app.dashed")
                                    .padding(.bottom)
                                    .labelStyle(.iconOnly)
                                    .foregroundStyle(Color.pink)
                                Text("no data")
                                    .padding(.bottom)
                            }
                            .navigationTitle("Teams")
                        } else {
                            VStack {
                                Label("loading", systemImage: "hourglass")
                                    .padding(.bottom)
                                    .labelStyle(.iconOnly)
                                Text("loading teams...")
                                    .padding(.bottom)
                            }
                            .navigationTitle("Teams")
                        }
                    }
                }
            }
        }
        .onAppear() {
            fetchTeamsJson()
        }
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
                        self.loadFailed = false
                        self.loadComplete = true
                        self.teamsList = [result]
                    }
                } catch {
                    print("parse error \(error)")
                    self.loadFailed = true
                }
            } else if let error = error {
                print("fetch error: \(error)")
                self.loadFailed = true
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

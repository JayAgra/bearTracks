//
//  Teams.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import Foundation
import SwiftUI

/// Shows listing of top teams by scouting data performance, not RPs
struct Teams: View {
    @State private var teamsList: [TeamData] = []
    @State private var loadState: (Bool, Bool, Bool) = (false, false, false)
    @State private var searchText: String = ""
    @State private var performanceValue: Int = 0
    
    var body: some View {
        VStack {
            NavigationView {
                if !teamsList.isEmpty && !teamsList[0].isEmpty {
                    List {
                        ForEach(Array(searchResults.enumerated()), id: \.element.team.team) { index, team in
                            NavigationLink(destination: {
                                TeamView(team: String(team.team.team))
                                    .navigationTitle("team \(String(team.team.team))")
                            }, label: {
                                VStack {
                                    HStack {
                                        Text("\(String(index + 1))")
#if !os(watchOS)
                                            .font(.title)
#else
                                            .font(.title3)
#endif
                                            .padding(.leading)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                        Text("\(String(team.team.team))")
#if !os(watchOS)
                                            .font(.title)
#else
                                            .font(.title3)
#endif
                                            .padding(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
                                    }
                                    HStack {
                                        ProgressView(
                                            value: max(team.performanceValue(type: performanceValue) ?? 0, 0),
                                            total: max(teamsList[0][0].performanceValue(type: performanceValue) ?? 0, 1)
                                        )
                                        .padding([.leading, .trailing])
                                    }
                                }
#if targetEnvironment(macCatalyst)
                                .padding([.top, .bottom])
#endif
#if os(visionOS)
                                .padding(.bottom)
#endif
                            })
#if os(iOS)
                            .listRowBackground(UIDevice.current.userInterfaceIdiom == .pad ? Color.primary.colorInvert() : nil)
#elseif targetEnvironment(macCatalyst)
                            .listRowBackground(Color.primary.colorInvert())
#endif
                        }
#if os(watchOS)
                        Section {
                            VStack {
                                NavigationLink(destination: SettingsView()) {
                                    HStack {
                                        Text("Settings")
                                        Spacer()
                                        Label("", systemImage: "chevron.forward")
                                            .labelStyle(.iconOnly)
                                    }
                                    .padding([.leading, .trailing])
                                }
                            }
                            .padding([.leading, .trailing])
                        }
#endif
                    }
                    .navigationTitle("Teams")
#if !os(watchOS)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Picker(selection: $performanceValue, content: {
                                Label("Standard", systemImage: "line.3.horizontal.decrease.circle")
                                    .tag(0)
                                Label("Intake Speed", systemImage: "tray.and.arrow.down")
                                    .tag(1)
                                Label("Movement Speed", systemImage: "arrow.up.and.down.and.arrow.left.and.right")
                                    .tag(2)
                                Label("Outtake Speed", systemImage: "paperplane")
                                    .tag(3)
                                Label("Cycle Speed", systemImage: "arrow.triangle.2.circlepath")
                                    .tag(4)
                                Label("Defense", systemImage: "shield")
                                    .tag(5)
                            }, label: {
                                Label("type", systemImage: "line.3.horizontal.decrease.circle")
                                    .labelStyle(.iconOnly)
                            })
                            .onChange(of: performanceValue) { _ in
                                searchText = ""
                                teamsList[0].sort {
                                    if let mainWeightA = $0.performanceValue(type: performanceValue), let mainWeightB = $1.performanceValue(type: performanceValue) {
                                        return mainWeightA > mainWeightB
                                    } else {
                                        return true
                                    }
                                }
                            }
                        }
                    }
#endif
                } else {
                    if loadState.1 {
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
                        if loadState.2 {
                            Form {
                                Label("none", systemImage: "questionmark.app.dashed")
                                    .padding(.bottom)
                                    .labelStyle(.iconOnly)
                                    .foregroundStyle(Color.pink)
                                Text("no data")
                                    .padding(.bottom)
#if os(watchOS)
                                Section {
                                    VStack {
                                        NavigationLink(destination: SettingsView()) {
                                            HStack {
                                                Text("Settings")
                                                Spacer()
                                                Label("", systemImage: "chevron.forward")
                                                    .labelStyle(.iconOnly)
                                            }
                                            .padding([.leading, .trailing])
                                        }
                                    }
                                    .padding([.leading, .trailing])
                                }
#endif
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
            .searchable(text: $searchText)
        }
        .onAppear {
            fetchTeamsJson()
        }
    }
    
    var searchResults: [TeamElement] {
        if searchText.isEmpty {
            return teamsList[0]
        } else {
            return teamsList[0].filter { String($0.team.team).contains(searchText) }
        }
    }
    
    func fetchTeamsJson() {
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/data/teams/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "season") ?? "2024")/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")"
            )
        else {
            return
        }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    var result = try decoder.decode(TeamData.self, from: data)
                    result.sort {
                        if let mainWeightA = $0.performanceValue(type: 0), let mainWeightB = $1.performanceValue(type: 0) {
                            return mainWeightA > mainWeightB
                        } else {
                            return true
                        }
                    }
                    DispatchQueue.main.async {
                        self.loadState = (self.loadState.0, false, true)
                        self.teamsList = [result]
                    }
                } catch {
                    print("parse error \(error)")
                    self.loadState.1 = true
                }
            } else if let error = error {
                print("fetch error: \(error)")
                self.loadState.1 = true
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
    
    func performanceValue(type: Int) -> Float? {
        let teamWeights = team.weight.components(separatedBy: ",").compactMap({ Float($0) })
        if teamWeights.count > type {
            if teamWeights[type] == .infinity {
                return 0
            } else {
                return teamWeights[type]
            }
        } else {
            return 0
        }
    }
}

/// bearTracks API response structure
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

/// Alias of `TeamEl` to match the exact structure of API response
/// > Can remove this in future versions
typealias TeamData = [TeamElement]

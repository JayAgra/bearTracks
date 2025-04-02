//
//  TeamView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct TeamView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var dataItems: TeamViewModel
    
    var body: some View {
        VStack {
            
            List {
#if !os(watchOS)
                Text("\(appState.allTeams.nameShort(for: Int(dataItems.targetTeam) ?? 0))")
                Section {
                    VStack {
                        if dataItems.teamData.isEmpty {
                            HStack { Spacer(); VStack { ProgressView(); Text("Loading third-party data..."); }; Spacer(); }
                        } else {
                            HStack {
                                VStack {
                                    Text(String(dataItems.teamData.first?.record?.qual?.wins ?? 0))
                                        .font(.title)
                                    Text("Wins")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text(String(dataItems.teamData.first?.record?.qual?.losses ?? 0))
                                        .font(.title)
                                    Text("Losses")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text(String(dataItems.teamData.first?.record?.qual?.ties ?? 0))
                                        .font(.title)
                                    Text("Ties")
                                }
                                .frame(maxWidth: .infinity)
                            }
                            .padding(.bottom)
                            HStack {
                                VStack {
                                    Text(String(dataItems.teamData.first?.record?.qual?.rank ?? 99))
                                        .font(.title)
                                    Text("Rank")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text(String(dataItems.teamData.first?.record?.qual?.rps ?? 0))
                                        .font(.title)
                                    Text("RPs")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text(String(format: "%.1f", dataItems.teamData.first?.record?.qual?.rps_per_match ?? 0.0))
                                        .font(.title)
                                    Text("RPs / match")
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                    }
                }
                Section {
#if !os(watchOS)
                    NavigationLink(destination: PitDataView(teamNumber: Int(dataItems.targetTeam) ?? 0)) {
                        HStack {
                            Text("Pit Scouting Data")
                        }
                    }
#endif
                    NavigationLink(destination: TeamViewStats(teamNum: dataItems.targetTeam).environmentObject(appState).navigationBarTitleDisplayMode(.automatic)) {
                        HStack {
                            Text("Additional Details")
                        }
                    }
                }
#endif
                if !dataItems.teamMatches.isEmpty {
                    Section {
                        ForEach(0..<dataItems.teamMatches.count, id: \.self) { index in
                            NavigationLink(destination: {
                                DetailedView(model: String(dataItems.teamMatches[index].Brief.id))
                                    .navigationTitle("#\(String(dataItems.teamMatches[index].Brief.id))")
                                    .navigationBarTitleDisplayMode(.automatic)
                                    .environmentObject(appState)
                            }, label: {
                                VStack {
                                    HStack {
                                        Text("Match \(String(dataItems.teamMatches[index].Brief.match_num))")
#if !os(watchOS)
                                            .font(.title)
#else
                                            .font(.title3)
#endif
                                            .padding(.leading)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    HStack {
                                        Text(
                                            "#\(String(dataItems.teamMatches[index].Brief.id)) • from \(String(dataItems.teamMatches[index].Brief.from_team)) (\(dataItems.teamMatches[index].Brief.name))"
                                        )
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                    HStack {
                                        ProgressView(
                                            value: (max(dataItems.teamMatches[index].Brief.weight.components(separatedBy: ",").compactMap({ Float($0) }).first ?? 0, 0)) / max(dataItems.maximumValue, 1)
                                        )
                                        .padding([.leading, .trailing])
                                    }
                                }
                                .contentShape(Rectangle())
                            })
#if targetEnvironment(macCatalyst)
                            .padding([.top, .bottom])
#endif
                        }
                    }
                } else {
                    if dataItems.loadComplete.0 && dataItems.loadComplete.1 && (dataItems.teamData.isEmpty || dataItems.teamMatches.isEmpty) {
                        Label("Match data loading failed, or there was no data found for this team.", systemImage: "xmark.seal.fill").navigationTitle("Team \(String(dataItems.targetTeam))")
                    } else {
                        HStack { Spacer(); ProgressView(); Spacer(); }
                    }
                }
            }
            
        }
        .navigationTitle("Team \(String(dataItems.targetTeam))")
    }
    
    private func divideNotZero(num: Int, denom: Int) -> Double {
        if denom == 0 {
            return 0.0
        } else {
            return Double(num) / Double(denom)
        }
    }
}

#Preview {
    TeamView(dataItems: TeamViewModel(team: "766"))
}

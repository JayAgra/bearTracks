//
//  TeamView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct TeamView: View {
    @ObservedObject var dataItems: TeamViewModel
    @State private var didInitialLoad: Bool = false
    @State private var showSheet: Bool = false
    
    
    init(team: String) {
        self.dataItems = TeamViewModel(team: team)
    }
    
    var body: some View {
        VStack {
            if !(dataItems.teamData.isEmpty || dataItems.teamMatches.isEmpty) {
                Text("Team \(String(dataItems.teamData.first?.team ?? 766))")
                    .font(.largeTitle)
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                HStack {
                    VStack {
                        Text(String((dataItems.teamData.first?.wins ?? 0)))
                            .font(.title)
                        Text("wins")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String((dataItems.teamData.first?.losses ?? 0)))
                            .font(.title)
                        Text("losses")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String((dataItems.teamData.first?.ties ?? 0)))
                            .font(.title)
                        Text("ties")
                    }
                    .frame(maxWidth: .infinity)
                }
                .padding()
                HStack {
                    VStack {
                        Text(String((dataItems.teamData.first?.rank ?? 99)))
                            .font(.title)
                        Text("rank")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String((dataItems.teamData.first?.rps ?? 0)))
                            .font(.title)
                        Text("RPs")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(
                            String(
                                Double(
                                    round(10 * (Double) (dataItems.teamData.first?.rps ?? 0) / (Double) (dataItems.teamData.first?.count ?? 1)) / 10
                                )
                            )
                        )
                            .font(.title)
                        Text("RPs / match")
                    }
                    .frame(maxWidth: .infinity)
                }
                .padding()
                Divider()
                List {
                    ForEach(dataItems.teamMatches, id: \.Brief.id) { entry in
                        VStack {
                            HStack {
                                Text("match \(String(entry.Brief.match_num))")
                                    .font(.title)
                                    .padding(.leading)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            HStack {
                                Text("#\(String(entry.Brief.id)) • from \(String(entry.Brief.from_team)) (\(entry.Brief.name))")
                                    .padding(.leading)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            HStack {
                                ProgressView(value: (max(entry.Brief.weight.components(separatedBy: ",").compactMap({ Float($0) }).first ?? 0, 0)) / max(dataItems.maximumValue, 1))
                                    .padding([.leading, .trailing])
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture() {
                            dataItems.setSelectedItem(item: String(entry.Brief.id))
                            showSheet = true
                        }
                    }
                }
            } else {
                Text("loading team...")
            }
        }
        .padding()
        .onAppear() {
            if !didInitialLoad {
                dataItems.reload()
                didInitialLoad = true
            }
        }
        .sheet(isPresented: $showSheet, onDismiss: {
            showSheet = false
        }, content: {
            TeamDetailedView(model: dataItems)
        })
    }
}

#Preview {
    TeamView(team: "766")
}

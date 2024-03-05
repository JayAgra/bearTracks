//
//  TeamView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

/// View for team's details
struct TeamView: View {
    @ObservedObject var dataItems: TeamViewModel
    @State private var showStats: Bool = false
    @State private var showSheet: Bool = false
    
    
    init(team: String) {
        self.dataItems = TeamViewModel(team: team)
    }
    
    var body: some View {
        VStack {
            if !dataItems.teamMatches.isEmpty {
#if !os(watchOS)
                HStack {
                    VStack {
                        Text(String(dataItems.teamData.first?.wins ?? 0))
                            .font(.title)
                        Text("wins")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String(dataItems.teamData.first?.losses ?? 0))
                            .font(.title)
                        Text("losses")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String(dataItems.teamData.first?.ties ?? 0))
                            .font(.title)
                        Text("ties")
                    }
                    .frame(maxWidth: .infinity)
                }
                .padding()
                HStack {
                    VStack {
                        Text(String(dataItems.teamData.first?.rank ?? 99))
                            .font(.title)
                        Text("rank")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(String(dataItems.teamData.first?.rps ?? 0))
                            .font(.title)
                        Text("RPs")
                    }
                    .frame(maxWidth: .infinity)
                    VStack {
                        Text(
                            String(format: "%.1f", divideNotZero(num: dataItems.teamData.first?.rps ?? 0, denom: dataItems.teamData.first?.count ?? 1))
                        )
                            .font(.title)
                        Text("RPs / match")
                    }
                    .frame(maxWidth: .infinity)
                }
                .padding()
                VStack {
                    NavigationLink(destination: TeamViewStats(teamNum: dataItems.targetTeam)) {
                        HStack {
                            Text("Additional Details")
                            Spacer()
                            Label("", systemImage: "chevron.forward")
                                .labelStyle(.iconOnly)
                        }
                        .padding([.leading, .trailing])
                    }
                }
                .padding([.leading, .trailing])
                Divider()
#endif
                List {
                    ForEach(dataItems.teamMatches) { entry in
                        VStack {
                            HStack {
                                Text("match \(String(entry.Brief.match_num))")
#if !os(watchOS)
                                    .font(.title)
#else
                                    .font(.title3)
#endif
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
#if targetEnvironment(macCatalyst)
                        .padding([.top, .bottom])
#endif
                    }
                }
                .navigationDestination(isPresented: $showSheet) {
                    DetailedView(model: dataItems.getSelectedItem())
                        .navigationTitle("#\(dataItems.getSelectedItem())")
                }
            } else {
                if dataItems.loadComplete.0 && dataItems.loadComplete.1 && (dataItems.teamData.isEmpty || dataItems.teamMatches.isEmpty) {
                    Label("loading failed", systemImage: "xmark.seal.fill")
                } else {
                    Text("loading team...")
                }
            }
        }
        .padding()
        .onAppear() {
            dataItems.reload()
        }
    }
    
    private func divideNotZero(num: Int, denom: Int) -> Double {
        if denom == 0 {
            return 0.0
        } else {
            return  Double(num) / Double(denom)
        }
    }
}

#Preview {
    TeamView(team: "766")
}

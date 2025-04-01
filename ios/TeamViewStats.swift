//
//  TeamViewStats.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/14/24.
//

import SwiftUI

struct TeamViewStats: View {
    @ObservedObject var teamDetail: TeamStatController = TeamStatController()
    
    init(teamNum: String) {
        self.teamDetail.teamNumber = teamNum
        self.teamDetail.fetchTeamDataJson()
    }
    
    var body: some View {
        VStack {
            ScrollView {
                if !teamDetail.teamData.isEmpty {
                    Picker("type", selection: $teamDetail.statType) {
                        Text("Avg")
                            .tag(StatType.mean)
                        Text("25th")
                            .tag(StatType.first)
                        Text("Median")
                            .tag(StatType.median)
                        Text("75th")
                            .tag(StatType.third)
                        Text("Decaying")
                            .tag(StatType.decay)
                    }
                    .pickerStyle(.segmented)
                    .padding()
#if !os(visionOS)
                    .onChange(of: teamDetail.statType) { value in
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    }
#endif
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].intake_time)))s")
                                .font(.title)
                            Text("Intake")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].travel_time)))s")
                                .font(.title)
                            Text("Move")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].outtake_time)))s")
                                .font(.title)
                            Text("Outtake")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].level_0)))")
                                .font(.title)
                            Text("L1")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].level_1)))")
                                .font(.title)
                            Text("L2")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].level_2)))")
                                .font(.title)
                            Text("L3")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].level_3)))")
                                .font(.title)
                            Text("L4")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].algae)))")
                                .font(.title)
                            Text("Algae")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].level_0) + getRelevantData(item: teamDetail.teamData[0].level_1) + getRelevantData(item: teamDetail.teamData[0].level_2) + getRelevantData(item: teamDetail.teamData[0].level_3)))")
                                .font(.title)
                            Text("Coral")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].auto_scores)))")
                                .font(.title)
                            Text("Auto scores")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].shallow_cage ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("Cage")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].deep_cage ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("Deep Cage")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].park ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("Park")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].score))) pts")
                                .font(.title)
                            Text("Performance rating")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    Spacer()
                } else {
                    Spacer()
                    ProgressView()
                        .controlSize(.large)
                        .padding()
                    Text("Loading...")
                        .font(.title)
                    Spacer()
                }
            }
            .navigationTitle("\(teamDetail.teamNumber) Stats")
        }
    }
    
    private func getRelevantData(item: DataStats) -> Int {
        switch teamDetail.statType {
        case .mean:
            return item.mean
        case .first:
            return item.first
        case .median:
            return item.median
        case .third:
            return item.third
        case .decay:
            return item.decaying
        }
    }
}

#Preview {
    TeamViewStats(teamNum: "766")
}

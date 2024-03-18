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
                        Text("avg")
                            .tag(StatType.mean)
                        Text("25th")
                            .tag(StatType.first)
                        Text("median")
                            .tag(StatType.median)
                        Text("75th")
                            .tag(StatType.third)
                        Text("decaying")
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
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].intake)))s")
                                .font(.title)
                            Text("intake")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].travel)))s")
                                .font(.title)
                            Text("move")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].outtake)))s")
                                .font(.title)
                            Text("outtake")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].speaker)))")
                                .font(.title)
                            Text("speaker")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].amplifier)))")
                                .font(.title)
                            Text("amplifier")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].auto_scores)))")
                                .font(.title)
                            Text("auto scores")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].trap_note ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("trap note")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].climb ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("climb")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(Int(((teamDetail.teamData[0].buddy_climb ?? 0) * 100).rounded()))%")
                                .font(.title)
                            Text("buddy climb")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].auto_preload)))")
                                .font(.title)
                            Text("auto preload")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].auto_wing)))")
                                .font(.title)
                            Text("auto wing")
                        }
                        .frame(maxWidth: .infinity)
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].auto_center)))")
                                .font(.title)
                            Text("auto center")
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding([.top, .bottom])
                    HStack {
                        VStack {
                            Text("\(String(getRelevantData(item: teamDetail.teamData[0].points))) pts")
                                .font(.title)
                            Text("performance rating")
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
                    Text("loading")
                        .font(.title)
                    Spacer()
                }
            }
            .navigationTitle("\(teamDetail.teamNumber) stats")
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

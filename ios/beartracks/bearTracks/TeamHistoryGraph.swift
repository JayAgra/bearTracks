//
//  TeamHistoryGraph.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 4/1/25.
//

import SwiftUI
import Charts

@available(iOS 18.0, *)
struct TeamHistoryGraph: View {
    private var teamNumber: Int
    @ObservedObject var teamGraphs: TeamHistoryGraphData
    @State private var data: [Int: [Double]] = [:]
    
    init(teamNumber: Int) {
        self.teamNumber = teamNumber
        self.teamGraphs = TeamHistoryGraphData(teamNumber: teamNumber)
    }
    
    var body: some View {
        VStack {
            if !data.isEmpty {
                ScrollView {
                    Text("Level 1 Coral").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Level 1", value[8])
                            )
                        }
                    }.padding([.horizontal, .bottom])
                    Text("Level 2 Coral").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Level 2", value[9])
                            )
                        }
                    }.padding([.horizontal, .bottom])
                    Text("Level 3 Coral").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Level 3", value[10])
                            )
                        }
                    }.padding([.horizontal, .bottom])
                    Text("Level 4 Coral").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Level 4", value[11])
                            )
                        }
                    }.padding([.horizontal, .bottom])
                    Text("Algae").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Algae", value[7])
                            )
                        }
                    }.padding([.horizontal, .bottom])
                    Text("Auto Leave").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Yes/No", value[0])
                            )
                        }
                    }.padding([.horizontal, .bottom]).chartYScale(domain: 0...1)
                    Text("Shallow Cage").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Yes/No", value[2])
                            )
                        }
                    }.padding([.horizontal, .bottom]).chartYScale(domain: 0...1)
                    Text("Deep Cage").font(.title2).padding([.horizontal, .top])
                    Chart {
                        ForEach(sortedData(), id: \.0) { key, value in
                            LineMark(
                                x: .value("Match", key),
                                y: .value("Yes/No", value[3])
                            )
                        }
                    }.padding([.horizontal, .bottom]).chartYScale(domain: 0...1)
                }
            } else {
                if teamGraphs.briefData.isEmpty {
                    Spacer()
                    Text("Loading Team Data...")
                        .onAppear {
                            teamGraphs.fetchDataJson()
                        }
                    Spacer()
                } else if !teamGraphs.briefData.isEmpty && data.isEmpty {
                    Spacer()
                    Text("Processing Team Data...")
                        .onAppear {
                            teamGraphs.processData(briefDataList: teamGraphs.briefData) { result in
                                data = result
                            }
                        }
                    Spacer()
                } else {
                    Spacer()
                    Text("Error: Illegal State Change!")
                    Spacer()
                }
            }
        }
    }
    
    private func sortedData() -> [(key: Int, value: [Double])] {
        return data.sorted { $0.key < $1.key }
    }
}

#Preview {
    if #available(iOS 18.0, *) {
        TeamHistoryGraph(teamNumber: 766)
    } else {
        Text("Only available on iOS 18 and later.")
    }
}

//
//  DetailedView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import Foundation
import SwiftUI

/// View details about a specific submission. Only one season should be suported at a time.
struct DetailedView: View {
    @State private var detailData: [DetailedData] = []
    @State private var gameData: [MatchTime2024] = []
    private var dataId: String
    
    init(model: String) {
        dataId = model
    }
    
    var body: some View {
        VStack {
            if !detailData.isEmpty {
                if detailData[0].FullMain.season == 2024 {
                    ScrollView {
                        Text("Team \(String(detailData[0].FullMain.team))")
#if !os(watchOS)
                            .font(.largeTitle)
#else
                            .font(.title3)
#endif
                            .padding([.top, .leading])
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Text(
                            "\(detailData[0].FullMain.level) \(String(detailData[0].FullMain.match_num)) @ \(detailData[0].FullMain.event) \(String(detailData[0].FullMain.season))"
                        )
#if !os(watchOS)
                        .font(.title2)
#else
                        .font(.body)
#endif
                        .padding(.leading)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        VStack {
                            Text("Author: ")
                                .fontWeight(.bold)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            Text("\(detailData[0].FullMain.name) (\(String(detailData[0].FullMain.from_team)))")
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding([.top, .leading])
                        VStack {
                            HStack {
                                VStack {
                                    Text("\(String(detailData[0].FullMain.analysis.split(separator: ",")[3]))s")
#if !os(watchOS)
                                        .font(.title)
#else
                                        .font(.title3)
#endif
                                    Text("intake")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text("\(String(detailData[0].FullMain.analysis.split(separator: ",")[4]))s")
#if !os(watchOS)
                                        .font(.title)
#else
                                        .font(.title3)
#endif
                                    Text("travel")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text("\(String(detailData[0].FullMain.analysis.split(separator: ",")[5]))s")
#if !os(watchOS)
                                        .font(.title)
#else
                                        .font(.title3)
#endif
                                    Text("outtake")
                                }
                                .frame(maxWidth: .infinity)
                            }
                            .padding()
                        }
                        .padding([.top, .leading])
                        VStack {
                            HStack {
                                VStack {
                                    Text(String(detailData[0].FullMain.analysis.split(separator: ",")[6]))
#if !os(watchOS)
                                        .font(.title)
#else
                                        .font(.title3)
#endif
                                    Text("speaker")
                                }
                                .frame(maxWidth: .infinity)
                                VStack {
                                    Text(String(detailData[0].FullMain.analysis.split(separator: ",")[7]))
#if !os(watchOS)
                                        .font(.title)
#else
                                        .font(.title3)
#endif
                                    Text("amplifier")
                                }
                                .frame(maxWidth: .infinity)
                            }
                            .padding()
                        }
                        .padding([.top, .leading])
                        VStack {
                            Text("Cycles")
                                .font(.title2)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            VStack {
                                Divider()
                                ForEach(gameData) { matchTime in
                                    VStack {
                                        HStack {
                                            switch matchTime.score_type {
                                            case 0:
                                                Text("Speaker")
                                                    .font(.title3)
                                                Spacer()
                                                Text(
                                                    "\(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))s"
                                                )
                                                .font(.title3)
                                            case 1:
                                                Text("Amplifier")
                                                    .font(.title3)
                                                Spacer()
                                                Text(
                                                    "\(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))s"
                                                )
                                                .font(.title3)
                                            case 2:
                                                Text("Trap Note")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(matchTime.intake == 1 ? "✅" : "❌")")
                                                    .font(.title3)
                                            case 3:
                                                Text("Climb")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(matchTime.intake == 1 ? "✅" : "❌")")
                                                    .font(.title3)
                                            case 4:
                                                Text("Buddy Climb")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(matchTime.intake == 1 ? "✅" : "❌")")
                                                    .font(.title3)
                                            case 5:
                                                Text("Auto Neutral Handle")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(Int(matchTime.intake))")
                                                    .font(.title3)
                                            case 6:
                                                Text("Auto Wing Handle")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(Int(matchTime.intake))")
                                                    .font(.title3)
                                            case 7:
                                                Text("Auto Preload Handle")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(Int(matchTime.intake))")
                                                    .font(.title3)
                                            case 8:
                                                Text("Auto Scores")
                                                    .font(.title3)
                                                Spacer()
                                                Text("\(Int(matchTime.intake))")
                                                    .font(.title3)
                                            case 9:
                                                Text("Shuttle")
                                                    .font(.title3)
                                                Spacer()
                                                Text(
                                                    "\(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))s"
                                                )
                                                .font(.title3)
                                            default:
                                                Text("Unknown entry")
                                            }
                                        }
                                        if matchTime.score_type == 0 || matchTime.score_type == 1
                                            || matchTime.score_type == 9
                                        {
                                            HStack {
                                                Spacer()
                                                Label(
                                                    String(format: "%.1f", matchTime.intake),
                                                    systemImage: "tray.and.arrow.down"
                                                )
#if os(watchOS)
                                                .labelStyle(.titleOnly)
#endif
                                                Spacer()
                                                Label(
                                                    String(format: "%.1f", matchTime.travel),
                                                    systemImage: "arrow.up.and.down.and.arrow.left.and.right"
                                                )
#if os(watchOS)
                                                .labelStyle(.titleOnly)
#endif
                                                Spacer()
                                                Label(
                                                    String(format: "%.1f", matchTime.outtake),
                                                    systemImage: "tray.and.arrow.up"
                                                )
#if os(watchOS)
                                                .labelStyle(.titleOnly)
#endif
                                                Spacer()
                                            }
                                            .padding(.top)
                                        }
                                    }
                                    .padding([.leading, .trailing])
                                    Divider()
                                }
                            }
                            .padding([.leading, .trailing])
                        }
                        .padding(.leading)
                        VStack {
                            Text("other")
                                .font(.title2)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            VStack {
                                VStack {
                                    Text("defense")
                                        .fontWeight(.bold)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("\(String(detailData[0].FullMain.defend))")
                                        .padding([.leading, .trailing])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }.padding(.bottom)
                                VStack {
                                    Text("driving")
                                        .fontWeight(.bold)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("\(String(detailData[0].FullMain.driving))")
                                        .padding([.leading, .trailing])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }.padding(.bottom)
                                VStack {
                                    Text("overall")
                                        .fontWeight(.bold)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("\(String(detailData[0].FullMain.overall))")
                                        .padding([.leading, .trailing])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }.padding(.bottom)
                                VStack {
                                    Text("match performance score")
                                        .fontWeight(.bold)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text(
                                        "\(Float(detailData[0].FullMain.weight.components(separatedBy: ",")[0]) ?? 0)"
                                    )
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }.padding(.bottom)
                            }
                            .padding(.leading)
                        }
                        .padding([.top, .leading])
                    }  // end scrollview
                } else {
                    Text("Error: Unsupported Season")
                        .padding(.bottom)
                }
            } else {
                Text("Loading...")
                    .padding(.bottom)
            }
        }
        .onAppear {
            fetchDetailJson()
        }
    }
    
    func fetchDetailJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/detail/\(dataId)") else {
            return
        }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DetailedData].self, from: data)
                    DispatchQueue.main.async {
                        self.detailData = result
                        if !result.isEmpty && result[0].FullMain.season == 2024 {
                            do {
                                self.gameData = try decoder.decode(
                                    [MatchTime2024].self, from: Data(result[0].FullMain.game.utf8))
                            } catch {
                                print("Parse error")
                            }
                        }
                    }
                } catch {
                    print("Parse error")
                }
            } else if let error = error {
                print("Fetch error: \(error)")
            }
        }
        .resume()
    }
    
    func valueToEmoji(input: String) -> String {
        if input == "true" {
            return "✅"
        } else {
            return "❌"
        }
    }
}

struct DetailedData: Codable {
    let FullMain: FullMainData
}

struct FullMainData: Codable {
    let id: Int
    let event: String
    let season: Int
    let team: Int
    let match_num: Int
    let level: String
    let game: String
    let defend: String
    let driving: String
    let overall: String
    let user_id: Int
    let name: String
    let from_team: Int
    let weight: String
    let analysis: String
}

struct MatchTime2024: Codable, Identifiable {
    var id = UUID()
    let score_type: Int
    let intake: Float
    let outtake: Float
    let travel: Float
    
    enum CodingKeys: CodingKey {
        case score_type
        case intake
        case outtake
        case travel
    }
}

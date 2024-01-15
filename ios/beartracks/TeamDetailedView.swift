//
//  TeamDetailedView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI
import Foundation

struct TeamDetailedView: View {
    @State private var detailData: [DetailedData] = []
    @State private var gameData: [String] = []
    private var dataModel: TeamViewModel
    
    init(model: TeamViewModel) {
        dataModel = model
    }
    
    var body: some View {
        VStack {
            if !detailData.isEmpty {
                ScrollView {
                    Text("\(detailData[0].FullMain.level) \(String(detailData[0].FullMain.match_num))")
                        .font(.largeTitle)
                        .padding([.top, .leading])
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text("Team \(String(detailData[0].FullMain.team)) @ \(detailData[0].FullMain.event) \(String(detailData[0].FullMain.season))")
                        .font(.title2)
                        .padding(.leading)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    VStack {
                        Text("Author:")
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Text("\(detailData[0].FullMain.name) (\(String(detailData[0].FullMain.from_team)))")
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding([.top, .leading])
                    VStack {
                        Text("autonomous")
                            .font(.title2)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        VStack {
                            VStack {
                                Text("Taxi")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(valueToEmoji(input: gameData[0]))")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("Score B/M/T")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(valueToEmoji(input: gameData[1]))\(valueToEmoji(input: gameData[2]))\(valueToEmoji(input: gameData[3]))")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("Charging")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[4]) points")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                        }
                        .padding(.leading)
                    }
                    .padding([.top, .leading])
                    VStack {
                        Text("teleoperated")
                            .font(.title2)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        VStack {
                            VStack {
                                Text("Score B/M/T")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(valueToEmoji(input: gameData[5]))\(valueToEmoji(input: gameData[6]))\(valueToEmoji(input: gameData[7]))")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("Charging")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[9]) points")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("Grid")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[11].replacingOccurrences(of: "0", with: "⬜").replacingOccurrences(of: "1", with: "🟪").replacingOccurrences(of: "2", with: "🟨").separate(every: 9, with: "\n"))")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                        }
                        .padding(.leading)
                    }
                    .padding(.leading)
                    VStack {
                        Text("other")
                            .font(.title2)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        VStack {
                            VStack {
                                Text("alliance coopertition")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(valueToEmoji(input: gameData[8]))")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("cycle time")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[10]) seconds")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
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
                                Text("low/mid/high cubes, cones, pcs")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[20])/\(gameData[13])/\(gameData[15]), \(gameData[12])/\(gameData[14])/\(gameData[16]), \(gameData[17])/\(gameData[18])/\(gameData[19])")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("cubes/cones")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[22])/\(gameData[23])")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("grid points")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(gameData[24])")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                            VStack {
                                Text("match performance score")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                Text("\(Float(detailData[0].FullMain.weight.components(separatedBy: ",")[0]) ?? 0)")
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }.padding(.bottom)
                        }
                        .padding(.leading)
                    }
                    .padding([.top, .leading])
                }
                .padding(.leading)
            } else {
                Text("loading details...")
                    .padding(.bottom)
            }
        }.onAppear() {
            fetchDetailJson()
        }
    }
    
    func fetchDetailJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/detail/\(dataModel.getSelectedItem())") else {
            return
        }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DetailedData].self, from: data)
                    DispatchQueue.main.async {
                        self.detailData = result
                        if !result.isEmpty {
                            self.gameData = result[0].FullMain.game.components(separatedBy: ",");
                        }
                    }
                } catch {
                    print("parse error")
                }
            } else if let error = error {
                print("fetch error: \(error)")
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

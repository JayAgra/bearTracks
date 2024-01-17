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
    @State private var gameData: [MatchTime2024] = [];
    private var dataModel: TeamViewModel
    
    init(model: TeamViewModel) {
        dataModel = model
    }
    
    var body: some View {
        VStack {
            if !detailData.isEmpty {
                if detailData[0].FullMain.season == 2024 {
                    ScrollView {
                        Text("Team \(String(detailData[0].FullMain.team))")
                            .font(.largeTitle)
                            .padding([.top, .leading])
                            .frame(maxWidth: .infinity, alignment: .leading)
                        Text("\(detailData[0].FullMain.level) \(String(detailData[0].FullMain.match_num)) @ \(detailData[0].FullMain.event) \(String(detailData[0].FullMain.season))")
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
                            Text("cycles")
                                .font(.title2)
                                .frame(maxWidth: .infinity, alignment: .leading)
                            VStack {
                                Divider()
                                ForEach(gameData, id: \.id) { matchTime in
                                    VStack {
                                        HStack {
                                            if matchTime.speaker {
                                                Text("Speaker")
                                                    .font(.title3)
                                            } else {
                                                Text("Amplifier")
                                                    .font(.title3)
                                            }
                                            Spacer()
                                            Text("\(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))s")
                                                .font(.title3)
                                        }
                                        .padding(.bottom)
                                        HStack {
                                            Spacer()
                                            Label(String(format: "%.1f", matchTime.intake), systemImage: "tray.and.arrow.down")
                                            Spacer()
                                            Label(String(format: "%.1f", matchTime.travel), systemImage: "arrow.up.and.down.and.arrow.left.and.right")
                                            Spacer()
                                            Label(String(format: "%.1f", matchTime.outtake), systemImage: "tray.and.arrow.up")
                                            Spacer()
                                        }
                                    }
                                    .padding([.leading, .trailing])
                                    Divider()
                                }
                            }
                            .padding([.leading, .trailing])
                        }
                        .padding([.top, .leading])
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
                                    Text("\(Float(detailData[0].FullMain.weight.components(separatedBy: ",")[0]) ?? 0)")
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }.padding(.bottom)
                            }
                            .padding(.leading)
                        }
                        .padding([.top, .leading])
                    } // end scrollview
                } else {
                    Text("unsupported season")
                        .padding(.bottom)
                }
            } else {
                Text("loading details...")
                    .padding(.bottom)
            }
        }
        .onAppear() {
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
                        if !result.isEmpty && result[0].FullMain.season == 2024 {
                            do {
                                self.gameData = try decoder.decode([MatchTime2024].self, from: Data(result[0].FullMain.game.utf8))
                            } catch {
                                print("parse error")
                            }
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

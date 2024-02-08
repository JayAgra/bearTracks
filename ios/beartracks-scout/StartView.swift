//
//  StartView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct StartView: View {
    @EnvironmentObject var controller: ScoutingController
    @FocusState private var focusField: Bool
    
    var body: some View {
        VStack {
            NavigationStack {
                VStack {
                    Form {
                        Section {
                            Text("\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR") (\(UserDefaults.standard.string(forKey: "season") ?? "2024"))")
                        }
                        Section {
                            Picker("Match Number", selection: $controller.matchNumber) {
                                Text("SELECT")
                                    .tag("--")
                                    .disabled(true)
                                if !controller.matchList.isEmpty && !controller.matchList[0].Schedule.isEmpty {
                                    ForEach(0...controller.matchList[0].Schedule.count, id: \.self) { id in
                                        Text(String(id + 1))
                                            .tag(String(id + 1))
                                    }
                                }
                            }
                            .pickerStyle(.menu)
                            .onChange(of: controller.matchNumber) { _ in
                                controller.teamNumber = "--"
                            }
                            Picker("Team Number", selection: $controller.teamNumber) {
                                Text("SELECT")
                                    .tag("--")
                                    .disabled(true)
                                if !controller.matchList.isEmpty && !controller.matchList[0].Schedule.isEmpty {
                                    ForEach(controller.matchList[0].Schedule[(Int(controller.matchNumber) ?? 1) - 1].teams, id: \.teamNumber) { team_entry in
                                        Text(String(team_entry.teamNumber))
                                            .tag(String(team_entry.teamNumber))
                                    }
                                }
                            }
                            .pickerStyle(.menu)
                        }
                        Section {
                            Button("continue") {
                                controller.advanceToGame()
                            }
                        }
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
    }
}

#Preview {
    StartView()
}

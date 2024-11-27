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
            NavigationView {
                VStack {
                    Form {
                        Section {
                            Text(
                                "\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR") (\(UserDefaults.standard.string(forKey: "season") ?? "2024"))"
                            )
                        }
                        Section {
                            Stepper {
                                HStack {
                                    Text("Match Number: ")
                                    Spacer()
                                    Text("\(controller.matchNumber)")
                                }
                            } onIncrement: {
                                if controller.matchNumber < controller.matchList[0].Schedule.count {
                                    controller.teamNumber = "--"
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    controller.matchNumber += 1
                                }
                            } onDecrement: {
                                if controller.matchNumber > 1 {
                                    controller.teamNumber = "--"
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    controller.matchNumber -= 1
                                }
                            }
                            if controller.matchNumber != 0 {
                                Picker("Team Number", selection: $controller.teamNumber) {
                                    Text("SELECT")
                                        .tag("--")
                                        .disabled(true)
                                    if !controller.matchList.isEmpty && !controller.matchList[0].Schedule.isEmpty {
                                        ForEach(
                                            controller.matchList[0].Schedule[controller.matchNumber - 1].teams,
                                            id: \.teamNumber
                                        ) { team_entry in
                                            Text(String(team_entry.teamNumber))
                                                .tag(String(team_entry.teamNumber))
                                        }
                                    }
                                }
                                .pickerStyle(.menu)
                            }
                        }
                        if controller.matchNumber != 0 && controller.teamNumber != "--" {
                            Section {
                                Text("Autonomous Period")
                                Stepper {
                                    Text("Preloaded notes handled (\(controller.switches.5))")
                                } onIncrement: {
                                    if controller.switches.5 == 0 {
                                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                        controller.switches.6 += 1
                                        controller.switches.5 += 1
                                    }
                                } onDecrement: {
                                    if controller.switches.5 == 1 {
                                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                        controller.switches.5 -= 1
                                        scoresDecrement()
                                    }
                                }
                                Stepper {
                                    Text("Wing notes handled (\(controller.switches.4))")
                                } onIncrement: {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    controller.switches.6 += 1
                                    controller.switches.4 += 1
                                } onDecrement: {
                                    if controller.switches.4 > 0 {
                                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                        controller.switches.4 -= 1
                                        scoresDecrement()
                                    }
                                }
                                Stepper {
                                    Text("Neutral notes handled (\(controller.switches.3))")
                                } onIncrement: {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    controller.switches.6 += 1
                                    controller.switches.3 += 1
                                } onDecrement: {
                                    if controller.switches.3 > 0 {
                                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                        controller.switches.3 -= 1
                                        scoresDecrement()
                                    }
                                }
                            }
                            Section {
                                Stepper {
                                    Text("Scores (\(controller.switches.6))")
                                } onIncrement: {
                                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                                    controller.switches.6 += 1
                                } onDecrement: {
                                    scoresDecrement()
                                }
                            }
                        }
                        Section {
                            Button("Start Teleop") {
                                controller.advanceToTab(tab: .game)
                            }
                            .disabled(controller.matchNumber == 0 || controller.teamNumber == "--")
                        }
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
    }
    
    private func scoresDecrement() {
        if controller.switches.6 > 0 {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            controller.switches.6 -= 1
        }
    }
}

#Preview {
    StartView()
}

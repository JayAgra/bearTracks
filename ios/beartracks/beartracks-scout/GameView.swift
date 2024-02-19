//
//  GameView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct GameView: View {
    @EnvironmentObject var controller: ScoutingController
    @State private var holdLengths: (TimeInterval, TimeInterval, TimeInterval) = (0.0, 0.0, 0.0)
    @State private var timers: (Timer?, Timer?, Timer?)
    @State private var pressStarted: (Bool, Bool, Bool) = (false, false, false)
    
    var body: some View {
        VStack {
            NavigationStack {
                VStack {
                    if controller.getTeamNumber() != "--" && controller.getMatchNumber() != "--" {
                        HStack {
                            VStack {
                                Text(String(format: "%.1f", holdLengths.0))
                                    .font(.largeTitle)
                                Button("intake", systemImage: "tray.and.arrow.down") {}
                                .modifier(PressModifier(onPress: {
                                    if !pressStarted.0 {
                                        pressStarted.0 = true
                                        self.timers.0 = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                                            self.holdLengths.0 += 0.1
                                            controller.times[0] = self.holdLengths.0
                                        }
                                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                                    }
                                }, onRelease: {
                                    self.timers.0?.invalidate()
                                    self.pressStarted.0 = false
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                }))
                                .font(.largeTitle)
                                .labelStyle(.iconOnly)
                                .buttonStyle(.bordered)
                            }
                            .padding()
                            VStack {
                                Text(String(format: "%.1f", holdLengths.1))
                                    .font(.largeTitle)
                                Button("move", systemImage: "arrow.up.and.down.and.arrow.left.and.right") {}
                                .modifier(PressModifier(onPress: {
                                    if !pressStarted.1 {
                                        pressStarted.1 = true
                                        self.timers.1 = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                                            self.holdLengths.1 += 0.1
                                            controller.times[1] = self.holdLengths.1
                                        }
                                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                                    }
                                }, onRelease: {
                                    self.timers.1?.invalidate()
                                    self.pressStarted.1 = false
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                }))
                                .font(.largeTitle)
                                .labelStyle(.iconOnly)
                                .buttonStyle(.bordered)
                            }
                            .padding()
                            VStack {
                                Text(String(format: "%.1f", holdLengths.2))
                                    .font(.largeTitle)
                                Button("outtake", systemImage: "tray.and.arrow.up") {}
                                .modifier(PressModifier(onPress: {
                                    if !pressStarted.2 {
                                        pressStarted.2 = true
                                        self.timers.2 = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
                                            self.holdLengths.2 += 0.1
                                            controller.times[2] = self.holdLengths.2
                                        }
                                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                                    }
                                }, onRelease: {
                                    self.timers.2?.invalidate()
                                    self.pressStarted.2 = false
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                }))
                                .font(.largeTitle)
                                .labelStyle(.iconOnly)
                                .buttonStyle(.bordered)
                            }
                            .padding()
                        }
                        .padding(.bottom)
                        HStack {
                            Button("speaker", systemImage: "speaker.wave.3") {
                                controller.clearSpeaker()
                                self.holdLengths = (0, 0, 0)
                            }
                            .font(.title)
                            .buttonStyle(.bordered)
                            .foregroundStyle(Color.green)
                        }
                        HStack {
                            Button("amplifier", systemImage: "speaker.plus") {
                                controller.clearAmplifier()
                                self.holdLengths = (0, 0, 0)
                            }
                            .font(.title)
                            .buttonStyle(.bordered)
                            .foregroundStyle(Color.green)
                        }
                        Button("endgame") {
                            controller.advanceToTab(tab: .end)
                        }
                        .padding()
                        .buttonStyle(.bordered)
                        Text("match \(controller.getMatchNumber()) • team \(controller.getTeamNumber())")
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.top)
                    } else {
                        Text("Please select a match number and event code on the start tab.")
                            .padding()
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
    }
}

#Preview {
    GameView()
}

//
//  GameView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct GameView: View {
    @ObservedObject var controller: ScoutingController
    
    var body: some View {
        VStack {
            NavigationView {
                VStack {
                    HStack {
                        VStack {
                            Text(String(format: "%.1f", controller.times[0]))
                                .font(.largeTitle)
                            Button("intake", systemImage: "tray.and.arrow.down") {
                            }.modifier(PressModifier(onPress: {
                                controller.beginClick(buttonIndex: 0)
                            }, onRelease: {
                                controller.endClick(buttonIndex: 0)
                            }))
                            .font(.largeTitle)
                            .labelStyle(.iconOnly)
                            .buttonStyle(.bordered)
                        }
                        .padding()
                        VStack {
                            Text(String(format: "%.1f", controller.times[1]))
                                .font(.largeTitle)
                            Button("move", systemImage: "arrow.up.and.down.and.arrow.left.and.right") {
                            }.modifier(PressModifier(onPress: {
                                controller.beginClick(buttonIndex: 1)
                            }, onRelease: {
                                controller.endClick(buttonIndex: 1)
                            }))
                            .font(.largeTitle)
                            .labelStyle(.iconOnly)
                            .buttonStyle(.bordered)
                        }
                        .padding()
                        VStack {
                            Text(String(format: "%.1f", controller.times[2]))
                                .font(.largeTitle)
                            Button("outtake", systemImage: "tray.and.arrow.up") {
                            }.modifier(PressModifier(onPress: {
                                controller.beginClick(buttonIndex: 2)
                            }, onRelease: {
                                controller.endClick(buttonIndex: 2)
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
                        }
                        .font(.title)
                        .buttonStyle(.bordered)
                        .foregroundStyle(Color.green)
                    }
                    HStack {
                        Button("amplifier", systemImage: "speaker.plus") {
                            controller.clearAmplifier()
                        }
                        .font(.title)
                        .buttonStyle(.bordered)
                        .foregroundStyle(Color.green)
                    }
                    Button("continue") {
                        controller.advanceToTab(tab: .end)
                    }
                    .padding()
                    .buttonStyle(.bordered)
                    Text("match \(controller.getMatchNumber()) • team \(controller.getTeamNumber())")
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .navigationTitle("Match Scouting")
            }
        }
        .onAppear() {
            if controller.getTeamNumber() == "" || controller.getMatchNumber() == "" {
                controller.advanceToTab(tab: .start)
            }
        }
    }
}

#Preview {
    GameView(controller: ScoutingController())
}

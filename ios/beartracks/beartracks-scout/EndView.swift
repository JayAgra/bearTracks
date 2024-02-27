//
//  EndView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct EndView: View {
    @EnvironmentObject var controller: ScoutingController
    
    var body: some View {
        NavigationStack {
                VStack {
                    if controller.getTeamNumber() != "--" || controller.getMatchNumber() != "--" {
                        Text("match \(controller.getMatchNumber()) • team \(controller.getTeamNumber())")
                            .padding(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        ScrollView {
                            VStack {
                                VStack {
                                    Toggle("Trap note", isOn: $controller.switches.0)
                                    Toggle("Trap note", isOn: $controller.switches.0)
                                    Toggle("Climb", isOn: $controller.switches.1)
                                        .onChange(of: controller.switches.1) { _ in
                                            if !controller.switches.1 {
                                                controller.switches.2 = false
                                            }
                                        }
                                    Toggle("Buddy climb", isOn: $controller.switches.2)
                                        .disabled(!controller.switches.1)
                                }
                                .padding()
                                VStack {
                                    Text("Did the robot play defense? If so, was it effective? Did it incur foul points?")
                                        .padding([.leading, .top])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    TextEditor(text: $controller.defense)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.gray, lineWidth: 1)
                                        )
                                        .frame(height: 150)
                                        .padding([.leading, .trailing])
                                }
                                VStack {
                                    Text("How was the driving? Did the driver seem confident?")
                                        .padding([.leading, .top])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    TextEditor(text: $controller.driving)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.gray, lineWidth: 1)
                                        )
                                        .frame(height: 150)
                                        .padding([.leading, .trailing])
                                }
                                VStack {
                                    Text("Provide an overall description of the team's performance in this match")
                                        .padding([.leading, .top])
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    TextEditor(text: $controller.overall)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.gray, lineWidth: 1)
                                        )
                                        .frame(height: 150)
                                        .padding([.leading, .trailing])
                                }
                            }
                            .padding(.bottom)
                            Button("review") {
                                controller.advanceToTab(tab: .review)
                            }
                            .padding()
                            .buttonStyle(.bordered)
                        }
                        Spacer()
                    } else {
                        Text("Please select a match number and event code on the start tab.")
                            .padding()
                    }
                }
                .navigationTitle("Match Scouting")
        }
    }
}

#Preview {
    EndView()
}

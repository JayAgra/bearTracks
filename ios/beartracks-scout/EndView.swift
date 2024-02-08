//
//  EndView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct EndView: View {
    @EnvironmentObject var controller: ScoutingController
    @State private var scoreTrap: Bool = false
    @State private var chainClimb: Bool = false
    @State private var buddyClimb: Bool = false
    @State private var defense: String = ""
    @State private var driving: String = ""
    @State private var overall: String = ""
    
    func loadPane() {
        self.defense = controller.getDefenseResponse()
        self.driving = controller.getDrivingResponse()
        self.overall = controller.getOverallResponse()
    }
    
    var body: some View {
        NavigationStack {
            VStack {
                Text("match \(controller.getMatchNumber()) • team \(controller.getTeamNumber())")
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                ScrollView {
                    VStack {
                        VStack {
                            Toggle("Trap note", isOn: $scoreTrap)
                            Toggle("Climb", isOn: $chainClimb)
                            Toggle("Buddy climb", isOn: $buddyClimb)
                        }
                        .padding()
                        VStack {
                            Text("Did the robot play defense? If so, was it effective? Did it incur foul points?")
                                .padding([.leading, .top])
                                .frame(maxWidth: .infinity, alignment: .leading)
                            TextEditor(text: $defense)
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
                            TextEditor(text: $driving)
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
                            TextEditor(text: $overall)
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
                        controller.addEndgameValue(type: 2, value: scoreTrap ? 1 : 0)
                        controller.addEndgameValue(type: 3, value: chainClimb ? 1 : 0)
                        controller.addEndgameValue(type: 4, value: buddyClimb ? 1 : 0)
                        controller.setDefenseResponse(response: defense)
                        controller.setDrivingResponse(response: driving)
                        controller.setOverallResponse(response: overall)
                        controller.advanceToTab(tab: .review)
                    }
                    .padding()
                    .buttonStyle(.bordered)
                }
                Spacer()
            }
            .onAppear() {
                if controller.getTeamNumber() == "--" || controller.getMatchNumber() == "--" {
                    controller.advanceToTab(tab: .start)
                } else {
                    loadPane()
                }
            }
            .navigationTitle("Match Scouting")
        }
    }
}

#Preview {
    EndView()
}
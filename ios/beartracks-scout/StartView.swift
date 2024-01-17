//
//  StartView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct StartView: View {
    @ObservedObject var controller: ScoutingController
    @State private var matchNumber: String = ""
    @State private var teamNumber: String = ""
    @FocusState private var focusField: Bool
    
    func loadPane() {
        self.matchNumber = controller.getMatchNumber()
        self.teamNumber = controller.getTeamNumber()
    }
    
    var body: some View {
        VStack {
            NavigationView {
                VStack {
                    LazyVStack {
                        Text("Match Number")
                            .padding([.leading, .top])
                            .frame(maxWidth: .infinity, alignment: .leading)
                        TextField("required", text: $matchNumber)
                            .focused($focusField)
                            .submitLabel(.done)
                            .keyboardType(.numberPad)
                            .toolbar {
                                ToolbarItem(placement: .keyboard) {
                                    HStack {
                                        Spacer()
                                        Button("Done") {  UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder),to: nil, from: nil, for: nil)
                                        }
                                    }
                                }
                            }
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .padding([.leading, .trailing])
                        
                        Text("Team Number")
                            .padding([.leading, .top])
                            .frame(maxWidth: .infinity, alignment: .leading)
                        TextField("required", text: $teamNumber)
                            .focused($focusField)
                            .submitLabel(.done)
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .padding([.leading, .trailing, .bottom])
                        
                        Button("continue") {
                                controller.setMatchNumber(match: matchNumber)
                            controller.setTeamNumber(team: teamNumber)
                            controller.advanceToGame()
                        }
                        .padding()
                        .buttonStyle(.bordered)
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
        .onAppear() {
            loadPane()
        }
    }
}

#Preview {
    StartView(controller: ScoutingController())
}

//
//  StartView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct StartView: View {
    enum FocusText: CaseIterable {
        case match, team
    }
    
    @ObservedObject var controller: ScoutingController
    @State private var matchNumber: String = ""
    @State private var teamNumber: String = ""
    @FocusState private var focusField: FocusText?
    
    var body: some View {
        VStack {
            Text("bearTracks")
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text("Match Scouting")
                .font(.largeTitle)
                .padding([.leading, .bottom])
                .frame(maxWidth: .infinity, alignment: .leading)
            ScrollView {
                LazyVStack {
                    Text("Match Number")
                        .padding([.leading, .top])
                        .frame(maxWidth: .infinity, alignment: .leading)
                    TextField("required", text: $matchNumber)
                        .focused($focusField, equals: .match)
                        .submitLabel(.done)
                        .keyboardType(.numberPad)
                        .toolbar {
                            ToolbarItem(placement: .keyboard) {
                                HStack {
                                    Spacer()
                                    Button("Next") {  UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder),to: nil, from: nil, for: nil)
                                        
                                        if focusField == .match {
                                            focusField = .team
                                        }
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
                        .focused($focusField, equals: .team)
                        .submitLabel(.done)
                        .keyboardType(.numberPad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .padding([.leading, .trailing, .bottom])
                    
                    Button("continue") {
                        focusField = nil
                        controller.setMatchNumber(match: matchNumber)
                        controller.setTeamNumber(team: teamNumber)
                        controller.advanceToGame()
                    }
                    .padding()
                    .buttonStyle(.bordered)
                }
            }
        }
    }
}

#Preview {
    StartView(controller: ScoutingController())
}

//
//  ReviewView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct ReviewView: View {
    @EnvironmentObject var controller: ScoutingController
    @State private var submitSheetState: SubmitSheetType = .waiting
    @State private var showSheet: Bool = false
    @State private var submitError: String = ""
    
    var body: some View {
        VStack {
            NavigationStack {
                VStack {
                    if controller.getTeamNumber() == "--" || controller.getMatchNumber() == "--" {
                        Text("Please select a match number and event code on the start tab.")
                            .padding()
                    } else if controller.getDefenseResponse() == "" || controller.getDrivingResponse() == "" || controller.getOverallResponse() == "" {
                        Text("Please fill in all three long form responses.")
                            .padding()
                    } else {
                        Text("Match \(controller.getMatchNumber()) • Team \(controller.getTeamNumber())")
                            .padding(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        ScrollView {
                            LazyVStack {
                                Text("Cycles")
                                    .font(.title2)
                                    .padding()
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                VStack {
                                    Divider()
                                    ForEach(controller.getMatchTimes(), id: \.id) { matchTime in
                                        VStack {
                                            HStack {
                                                if matchTime.score_type == 0 {
                                                    Text("Speaker")
                                                        .font(.title3)
                                                    Spacer()
                                                    Text(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))
                                                        .font(.title3)
                                                } else if matchTime.score_type == 1 {
                                                    Text("Amplifier")
                                                        .font(.title3)
                                                    Spacer()
                                                    Text(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))
                                                        .font(.title3)
                                                }
                                            }
                                            if matchTime.score_type == 0 || matchTime.score_type == 1 {
                                                HStack {
                                                    Spacer()
                                                    Text(String(format: "%.1f", matchTime.intake))
                                                    Spacer()
                                                    Text(String(format: "%.1f", matchTime.travel))
                                                    Spacer()
                                                    Text(String(format: "%.1f", matchTime.outtake))
                                                    Spacer()
                                                }
                                            }
                                        }
                                        .padding([.leading, .trailing])
                                        Divider()
                                    }
                                }
                                .padding([.leading, .trailing, .bottom])
                                VStack {
                                    Text("Defense")
                                        .font(.title2)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text(controller.getDefenseResponse())
                                        .padding()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding([.leading, .trailing])
                                }
                                .padding()
                                VStack {
                                    Text("Driving")
                                        .font(.title2)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text(controller.getDrivingResponse())
                                        .padding()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding([.leading, .trailing])
                                }
                                .padding()
                                VStack {
                                    Text("Overall")
                                        .font(.title2)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text(controller.getOverallResponse())
                                        .padding()
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding([.leading, .trailing])
                                }
                                .padding()
                            }
                        }
                        Button("submit") {
                            showSheet = true
                            controller.submitData { result in
                                self.submitSheetState = result.0
                                self.submitError = result.1
                            }
                        }
                        .padding()
                        .buttonStyle(.borderedProminent)
                    }
                }
                .sheet(isPresented: $showSheet) {
                    switch submitSheetState {
                    case .waiting:
                        VStack {
                            Spacer()
                            if #available(iOS 17.0, *) {
                                ProgressView()
                                    .controlSize(.extraLarge)
                                    .padding()
                            } else {
                                ProgressView()
                                    .controlSize(.large)
                                    .padding()
                            }
                            Text("submitting...")
                                .font(.title)
                            Spacer()
                        }
                    case .done:
                        VStack {
                            Spacer()
                            Label("done", systemImage: "checkmark.seal.fill")
                                .labelStyle(.iconOnly)
                                .font(.largeTitle)
                                .foregroundStyle(Color.green)
                                .padding()
                            Text("done")
                                .font(.title)
                            Spacer()
                        }
                        .onAppear() {
                            controller.resetControllerData()
                            controller.advanceToTab(tab: .start)
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                        }
                    case .error:
                        VStack {
                            Spacer()
                            Label("done", systemImage: "xmark.seal.fill")
                                .labelStyle(.iconOnly)
                                .font(.largeTitle)
                                .foregroundStyle(Color.red)
                                .padding()
                            Text("error")
                                .font(.title)
                                .padding()
                            Text(submitError)
                                .font(.title2)
                                .padding()
                            Spacer()
                        }
                        .onAppear() {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
    }
}

#Preview {
    ReviewView()
}

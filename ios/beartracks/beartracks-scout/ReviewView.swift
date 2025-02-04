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
            NavigationView {
                VStack {
                    if controller.getTeamNumber() == "--" || controller.getMatchNumber() == 0 {
                        Text("Please select a match and team number on the start tab.")
                            .padding()
                    } else if controller.getDefenseResponse() == "" || controller.getDrivingResponse() == "" || controller.getOverallResponse() == "" {
                        Text("Please fill in all three long form responses.")
                            .padding()
                            .onAppear {
                                if controller.getDefenseResponse() == "" {
                                    controller.defense = "No"
                                }
                            }
                    } else {
                        Text("Match \(controller.getMatchNumber()) • Team \(controller.getTeamNumber())\n\(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST") (\(UserDefaults.standard.string(forKey: "season") ?? "2025"))")
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
                                    ForEach($controller.matchTimes) { $matchTime in
                                        if matchTime.score_type >= 4 && matchTime.score_type <= 8 {
                                            VStack {
                                                HStack {
                                                    Picker("Type", selection: $matchTime.score_type) {
                                                        Text("Algae").tag(4)
                                                        Text("Level 1").tag(5)
                                                        Text("Level 2").tag(6)
                                                        Text("Level 3").tag(7)
                                                        Text("Level 4").tag(8)
                                                    }
                                                    .pickerStyle(.menu)
                                                    Spacer()
                                                    Text(
                                                        String(
                                                            format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake)
                                                    )
                                                    .font(.title3)
                                                }
                                                HStack {
                                                    Spacer()
                                                    Label(
                                                        String(format: "%.1f", matchTime.intake),
                                                        systemImage: "tray.and.arrow.down.fill")
                                                    Spacer()
                                                    Label(
                                                        String(format: "%.1f", matchTime.travel),
                                                        systemImage: "arrow.up.and.down.and.arrow.left.and.right")
                                                    Spacer()
                                                    Label(
                                                        String(format: "%.1f", matchTime.outtake), systemImage: "paperplane.fill")
                                                    Spacer()
                                                }
                                            }
                                            .padding([.leading, .trailing])
                                            Divider()
                                        }
                                    }
                                    if controller.matchTimes.isEmpty {
                                        Text("⚠️ You did not enter any cycles. If the robot completed no cycles, this is ok. Otherwise, do NOT submit the data and ensure you enter cycles for your next match. Application administrators will be notified of this submission, identifying you and your team as the submitter.")
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
                                        .onAppear {
                                            if controller.getDefenseResponse() == "" {
                                                controller.defense = "No"
                                            }
                                        }
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
                            Button("Submit") {
                                showSheet = true
                                controller.submitData { result in
                                    self.submitSheetState = result.0
                                    self.submitError = result.1
                                }
                            }
                            .padding()
                            .buttonStyle(.borderedProminent)
                        }
                        .onAppear {
                            if self.controller.defense == "" {
                                controller.defense = "No"
                            }
                        }
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
                            Text("Submitting...")
                                .font(.title)
                            Spacer()
                        }
                    case .done:
                        VStack {
                            Spacer()
                            Label("Done", systemImage: "checkmark.seal.fill")
                                .labelStyle(.iconOnly)
                                .font(.largeTitle)
                                .foregroundStyle(Color.green)
                                .padding()
                            Text("Done!")
                                .font(.title)
                            Spacer()
                        }
                        .onAppear {
                            controller.resetControllerData()
                            controller.advanceToTab(tab: .start)
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                        }
                    case .error:
                        VStack {
                            Spacer()
                            Label("Done", systemImage: "xmark.seal.fill")
                                .labelStyle(.iconOnly)
                                .font(.largeTitle)
                                .foregroundStyle(Color.red)
                                .padding()
                            Text("Fatal Error. Retry at will.")
                                .font(.title)
                                .padding()
                            Text(submitError)
                                .font(.title2)
                                .padding()
                            Spacer()
                        }
                        .onAppear {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                }
                .navigationTitle("Match Scouting")
            }
            .navigationViewStyle(StackNavigationViewStyle())
        }
    }
}

#Preview {
    ReviewView()
}

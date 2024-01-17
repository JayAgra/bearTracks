//
//  ReviewView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct ReviewView: View {
    @ObservedObject var controller: ScoutingController
    @State private var submitSheetState: SubmitSheetType = .waiting
    @State private var showSheet: Bool = false
    
    var body: some View {
        VStack {
            NavigationView {
                VStack {
                    ScrollView {
                        LazyVStack {
                            Text("Match \(controller.getMatchNumber()) • Team \(controller.getTeamNumber())")
                                .font(.caption)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                            Text("Cycles")
                                .font(.title2)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .leading)
                            VStack {
                                Divider()
                                ForEach(controller.getMatchTimes(), id: \.id) { matchTime in
                                    VStack {
                                        HStack {
                                            if matchTime.speaker {
                                                Text("Speaker")
                                                    .font(.title3)
                                            } else {
                                                Text("Amplifier")
                                                    .font(.title3)
                                            }
                                            Spacer()
                                            Text(String(format: "%.1f", matchTime.intake + matchTime.travel + matchTime.outtake))
                                                .font(.title3)
                                        }
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
                            self.submitSheetState = result
                        }
                    }
                    .padding()
                    .buttonStyle(.borderedProminent)
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
                            Spacer()
                        }
                    }
                }
                .onAppear() {
                    if controller.getTeamNumber() == "" || controller.getMatchNumber() == "" {
                        controller.advanceToTab(tab: .start)
                    } else {
                        if controller.getDefenseResponse() == "" || controller.getDrivingResponse() == "" || controller.getOverallResponse() == "" {
                            controller.advanceToTab(tab: .end)
                        }
                    }
                }
                .navigationTitle("Match Scouting")
            }
        }
    }
}

#Preview {
    ReviewView(controller: ScoutingController())
}

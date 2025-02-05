//
//  PitDataView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/5/25.
//

import SwiftUI

struct PitDataView: View {
    var teamNumber: Int
    @ObservedObject var controller: PitDataController
    
    init(teamNumber: Int) {
        self.teamNumber = teamNumber
        self.controller = PitDataController(teamNumber: teamNumber)
    }
    
    var body: some View {
        switch controller.pitDataState {
        case 0: (
            VStack {
                Spacer()
                ProgressView()
                Spacer()
            }
            .onAppear {
                controller.fetchPitData()
            }
        )
        case 1: (
            VStack {
                if controller.pitData.isEmpty {
                    Spacer()
                    Label("Empty", systemImage: "exclamationmark.triangle.fill")
                        .labelStyle(.iconOnly)
                        .font(.largeTitle)
                        .foregroundStyle(Color.yellow)
                        .padding()
                    Text("No data found.")
                        .font(.title)
                        .padding()
                    Spacer()
                } else {
                    if let mergedData = controller.mergedPitData {
                        VStack {
                            Form {
                                Section {
                                    Text("Can score...")
                                    HStack {
                                        Text("Algae (Processor)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.algae_proc.dropFirst().allSatisfy({ $0 == mergedData.algae_proc.first }), firstValue: mergedData.algae_proc[0])
                                    }
                                    HStack {
                                        Text("Algae (Net)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.algae_net.dropFirst().allSatisfy({ $0 == mergedData.algae_net.first }), firstValue: mergedData.algae_net[0])
                                    }
                                    HStack {
                                        Text("Coral (1)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.coral_1.dropFirst().allSatisfy({ $0 == mergedData.coral_1.first }), firstValue: mergedData.coral_1[0])
                                    }
                                    HStack {
                                        Text("Coral (2)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.coral_2.dropFirst().allSatisfy({ $0 == mergedData.coral_2.first }), firstValue: mergedData.coral_2[0])
                                    }
                                    HStack {
                                        Text("Coral (3)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.coral_3.dropFirst().allSatisfy({ $0 == mergedData.coral_3.first }), firstValue: mergedData.coral_3[0])
                                    }
                                    HStack {
                                        Text("Coral (4)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.coral_4.dropFirst().allSatisfy({ $0 == mergedData.coral_4.first }), firstValue: mergedData.coral_4[0])
                                    }
                                    HStack {
                                        Text("Cage (Shallow)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.shallow.dropFirst().allSatisfy({ $0 == mergedData.shallow.first }), firstValue: mergedData.shallow[0])
                                    }
                                    HStack {
                                        Text("Cage (Deep)")
                                        Spacer()
                                        booleanDisplay(value: mergedData.deep.dropFirst().allSatisfy({ $0 == mergedData.deep.first }), firstValue: mergedData.deep[0])
                                    }
                                }
                                Section {
                                    Text("Drivetrain")
                                    HStack {
                                        Text("Drivetrain")
                                        Spacer()
                                        allEqualTo(value: mergedData.drivetrain.dropFirst().allSatisfy({ $0 == mergedData.drivetrain.first }), textOptions: ["Swerve", "West Coast", "Mecanum", "Omni", "Other"])
                                    }
                                    HStack {
                                        Text("Swerve Modules")
                                        Spacer()
                                        allEqualTo(value: mergedData.swerve.dropFirst().allSatisfy({ $0 == mergedData.swerve.first }), textOptions: ["N/A", "SDS", "AndyMark", "REV", "Westcoast (X)", "Other"])
                                    }
                                }
                                Section {
                                    Text("Favorite...")
                                    HStack {
                                        Text("Game Piece")
                                        Spacer()
                                        allEqualTo(value: mergedData.favorite_piece.dropFirst().allSatisfy({ $0 == mergedData.favorite_piece.first }), textOptions: ["Algae", "Coral"])
                                    }
                                    HStack {
                                        Text("Coral Location")
                                        Spacer()
                                        allEqualTo(value: mergedData.favorite_coral.dropFirst().allSatisfy({ $0 == mergedData.favorite_coral.first }), textOptions: ["N/A", "Level 1", "Level 2", "Level 3", "Level 4"])
                                    }
                                    HStack {
                                        Text("Cage")
                                        Spacer()
                                        allEqualTo(value: mergedData.favorite_cage.dropFirst().allSatisfy({ $0 == mergedData.favorite_cage.first }), textOptions: ["N/A", "Shallow", "Deep"])
                                    }
                                }
                                Section {
                                    Text("Team's Estimations")
                                    HStack {
                                        Text("Cycles/Game")
                                        Spacer()
                                        allEqualTo(value: mergedData.estimated_cycles.dropFirst().allSatisfy({ $0 == mergedData.estimated_cycles.first }), textOptions: mergedData.estimated_cycles.map { String($0) })
                                    }
                                    HStack {
                                        Text("Auto Algae")
                                        Spacer()
                                        allEqualTo(value: mergedData.auto_algae.dropFirst().allSatisfy({ $0 == mergedData.auto_algae.first }), textOptions: mergedData.auto_algae.map { String($0) })
                                    }
                                    HStack {
                                        Text("Auto Coral")
                                        Spacer()
                                        allEqualTo(value: mergedData.auto_coral.dropFirst().allSatisfy({ $0 == mergedData.auto_coral.first }), textOptions: mergedData.auto_coral.map { String($0) })
                                    }
                                }
                                Section {
                                    ForEach(mergedData.notes, id: \.self) { notes in
                                        Text(notes)
                                    }
                                }
                            }
                        }
                    } else {
                        Spacer()
                        ProgressView()
                        Text("Restructuring Data")
                        Spacer()
                    }
                }
            }
        )
        case _: (
            VStack {
                Spacer()
                Label("Error", systemImage: "xmark.circle.fill")
                    .labelStyle(.iconOnly)
                    .font(.largeTitle)
                    .foregroundStyle(Color.red)
                    .padding()
                Text("Error")
                    .font(.title)
                    .padding()
                Text(controller.pitDataError ?? "Unknown Error")
                    .font(.title2)
                    .padding()
                Spacer()
            }
        )
        }
    }
    
    func booleanDisplay(value: Bool, firstValue: Bool) -> some View {
        return Label("Value", systemImage: value ? (firstValue ? "checkmark.circle.fill" : "xmark.circle.fill" ) : "exclamationmark.triangle.fill")
            .labelStyle(.iconOnly)
            .foregroundStyle(value ? (firstValue ? .green : .red) : .yellow)
    }
    
    func allEqualTo(value: Bool, textOptions: [String]) -> some View {
        return Label(String(textOptions[0]), systemImage: "exclamationmark.triangle.fill")
            .labelStyle(ConditionalLabelStyle(value: value))
            .foregroundStyle(value ? Color.primary : Color.yellow)
    }
}

struct ConditionalLabelStyle: LabelStyle {
    var value: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        if value {
            return AnyView(configuration.title)
        } else {
            return AnyView(configuration.icon)
        }
    }
}

#Preview {
    PitDataView(teamNumber: 766)
}

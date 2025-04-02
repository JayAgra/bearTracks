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
            .navigationTitle("\(String(teamNumber)) Pit Data")
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
                                    Text("Can score...").bold()
                                    PitDataBooleanViewer(data: mergedData.algae_proc, label: "Algae (Processor)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.algae_net, label: "Algae (Net)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.coral_1, label: "Coral (1)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.coral_2, label: "Coral (2)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.coral_3, label: "Coral (3)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.coral_4, label: "Coral (4)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.shallow, label: "Cage (Shallow)", mergedData: mergedData)
                                    PitDataBooleanViewer(data: mergedData.deep, label: "Cage (Deep)", mergedData: mergedData)
                                }
                                Section {
                                    PitDataIntViewer(data: mergedData.drivetrain, textOptions: ["Swerve", "West Coast", "Mecanum", "Omni", "Other"], label: "Drivetrain", mergedData: mergedData)
                                    PitDataIntViewer(data: mergedData.swerve, textOptions: ["N/A", "SDS", "AndyMark", "REV", "Westcoast (X)", "Other"], label: "Swerve Modules", mergedData: mergedData)
                                }
                                Section {
                                    PitDataIntViewer(data: mergedData.favorite_piece, textOptions: ["Algae", "Coral"], label: "Best Game Piece", mergedData: mergedData)
                                    PitDataIntViewer(data: mergedData.favorite_coral, textOptions: ["N/A", "Level 1", "Level 2", "Level 3", "Level 4"], label: "Best Coral Location", mergedData: mergedData)
                                    PitDataIntViewer(data: mergedData.favorite_cage, textOptions: ["N/A", "Shallow", "Deep"], label: "Best Cage", mergedData: mergedData)
                                }
                                Section {
                                    Text("Team's Estimations").bold()
                                    PitDataIntViewer(data: mergedData.estimated_cycles.indices.map { $0 }, textOptions: mergedData.estimated_cycles.map { String($0) }, label: "Cycles/Game", mergedData: mergedData)
                                    PitDataIntViewer(data: mergedData.estimated_cycles.indices.map { $0 }, textOptions: mergedData.auto_algae.map { String($0) }, label: "Auto Algae", mergedData: mergedData)
                                    PitDataIntViewer(data: mergedData.estimated_cycles.indices.map { $0 }, textOptions: mergedData.auto_coral.map { String($0) }, label: "Auto Coral", mergedData: mergedData)
                                }
                                Section {
                                    ForEach(mergedData.notes.indices, id: \.self) { index in
                                        Text("\(mergedData.notes[index])\n\n\(mergedData.name[index]) (\(String(mergedData.from_team[index])))")
                                    }
                                }
                                CarouselView(imagesUrls: mergedData.image_ids)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
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
                .navigationTitle("\(String(teamNumber)) Pit Data")
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
                .navigationTitle("\(String(teamNumber)) Pit Data")
        )
        }
    }
}

struct PitDataBooleanViewer: View {
    let data: [Bool]
    let label: String
    let mergedData: MergedPitData
    
    init (data: [Bool], label: String, mergedData: MergedPitData) {
        self.data = data
        self.label = label
        self.mergedData = mergedData
    }
    
    var body: some View {
        if !data.dropFirst().allSatisfy({ $0 == data.first }) {
            DisclosureGroup() {
                VStack {
                    ForEach(data.indices, id: \.self) { index in
                        HStack {
                            Text(String("\(mergedData.id[index]) • \(mergedData.name[index]) (\(mergedData.from_team[index]))"))
                            Spacer()
                            Text(String(data[index]))
                        }
                    }
                }
            } label: {
                HStack {
                    Text(label)
                    Spacer()
                    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Color.yellow)
                }
            }
        } else {
            HStack {
                Text(label)
                Spacer()
                booleanDisplay(value: data.dropFirst().allSatisfy({ $0 == data.first }), firstValue: data[0])
            }
        }
    }
    
    func booleanDisplay(value: Bool, firstValue: Bool) -> some View {
        return Label("Value", systemImage: value ? (firstValue ? "checkmark.circle.fill" : "xmark.circle.fill" ) : "exclamationmark.triangle.fill")
            .labelStyle(.iconOnly)
            .foregroundStyle(value ? (firstValue ? .green : .red) : .yellow)
    }
}

struct PitDataIntViewer: View {
    let data: [Int]
    let textOptions: [String]
    let label: String
    let mergedData: MergedPitData
    
    init (data: [Int], textOptions: [String], label: String, mergedData: MergedPitData) {
        self.data = data
        self.textOptions = textOptions
        self.label = label
        self.mergedData = mergedData
    }
    
    var body: some View {
        if !data.dropFirst().allSatisfy({ $0 == data.first }) {
            DisclosureGroup() {
                VStack {
                    ForEach(data.indices, id: \.self) { index in
                        HStack {
                            Text(String("\(mergedData.id[index]) • \(mergedData.name[index]) (\(mergedData.from_team[index]))"))
                            Spacer()
                            Text(String(textOptions[safe: index] ?? "Invalid Data"))
                        }
                    }
                }
            } label: {
                HStack {
                    Text(label)
                    Spacer()
                    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(Color.yellow)
                }
            }
        } else {
            HStack {
                Text(label)
                Spacer()
                Label(String(textOptions[safe: data.first ?? 255] ?? "Invalid Data"), systemImage: "exclamationmark.triangle.fill")
                    .labelStyle(.titleOnly)
            }
        }
    }
}

#Preview {
    PitDataView(teamNumber: 766)
}

extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

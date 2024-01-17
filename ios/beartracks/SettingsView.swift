//
//  SettingsView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct SettingsView: View {
    @State private var teamNumberInput: String = UserDefaults.standard.string(forKey: "teamNumber") ?? ""
    @State private var eventCodeInput: String = UserDefaults.standard.string(forKey: "eventCode") ?? ""
    @State private var seasonInput: String = UserDefaults.standard.string(forKey: "season") ?? ""
    @State private var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @State private var haptics: Bool = UserDefaults.standard.bool(forKey: "haptics")
    @State private var showAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack {
                    HStack {
                        Picker("Team Number", selection: $teamNumberInput) {
                            Text("766")
                                .tag("766")
                        }
                        .padding()
                        .pickerStyle(.menu)
                        Spacer()
                        Button("Save") {
                            saveTeamNumber()
                        }
                        .padding()
                    }
                    HStack {
                        Picker("Event Code", selection: $eventCodeInput) {
                            Text("CADA")
                                .tag("CADA")
                            Text("CASJ")
                                .tag("CASJ")
                            Text("CAFR")
                                .tag("CAFR")
                            Text("CABE")
                                .tag("CABE")
                            Text("WOOD")
                                .tag("WOOD")
                            Text("CCCC")
                                .tag("CCCC")
                        }
                        .pickerStyle(.menu)
                        .padding()
                        Spacer()
                        Button("Save") {
                            saveEventCode()
                        }
                        .padding()
                    }
                    HStack {
                        Picker("Season", selection: $seasonInput) {
                            Text("2023")
                                .tag("2023")
                            Text("2024")
                                .tag("2024")
                        }
                        .pickerStyle(.menu)
                        .padding()
                        Spacer()
                        Button("Save") {
                            saveSeason()
                        }
                        .padding()
                    }
                    HStack {
                        Toggle(isOn: $darkMode) {
                            Label("Dark Mode", systemImage: "moon.fill")
                        }
                        .padding()
                        .onChange(of: darkMode) {
                            UserDefaults.standard.set(darkMode, forKey: "darkMode")
                            showAlert = true
                        }
                    }
                }
            }
            .navigationTitle("Settings")
            .alert(isPresented: $showAlert, content: {
                Alert (
                    title: Text("theme change"),
                    message: Text("an app restart is required for the theme change to take effect"),
                    dismissButton: .default(Text("ok"))
                )
            })
        }
    }
    
    func saveTeamNumber() {
        UserDefaults.standard.set(teamNumberInput, forKey: "teamNumber")
    }
    
    func saveEventCode() {
        UserDefaults.standard.set(eventCodeInput, forKey: "eventCode")
    }
    
    func saveSeason() {
        UserDefaults.standard.set(seasonInput, forKey: "season")
    }
}

#Preview {
    SettingsView()
}

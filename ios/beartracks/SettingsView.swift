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
    @State private var showAlert = false
    
    var body: some View {
        VStack {
            Text("Settings")
                .font(.largeTitle)
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            VStack {
                Text("Team \(UserDefaults.standard.string(forKey: "teamNumber") ?? "766")")
                    .font(.title)
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("\(UserDefaults.standard.string(forKey: "eventCode") ?? "CADA") • \(UserDefaults.standard.string(forKey: "season") ?? "2023")")
                    .font(.title3)
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("bearTracks v5.0.0")
                    .font(.caption)
                    .padding(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }.padding()
            ScrollView {
                VStack {
                    HStack {
                        TextField("Team Number", text: $teamNumberInput)
                            .padding()
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        Button("Save") {
                            saveTeamNumber()
                        }
                    }
                    HStack {
                        TextField("Event Code", text: $eventCodeInput)
                            .padding()
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        Button("Save") {
                            saveEventCode()
                        }
                    }
                    HStack {
                        TextField("Season", text: $seasonInput)
                            .padding()
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        Button("Save") {
                            saveSeason()
                        }
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
            .alert(isPresented: $showAlert, content: {
                Alert (
                    title: Text("Theme Change"),
                    message: Text("You must restart the app for the change to take effect"),
                    dismissButton: .default(Text("Ok"))
                )
            })
        }
        .padding()
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

//
//  SettingsView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct SettingsView: View {
    @State private var eventCodeInput: String =
    UserDefaults.standard.string(forKey: "eventCode") ?? ""
    @State private var seasonInput: String = UserDefaults.standard.string(forKey: "season") ?? ""
    @State private var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @State private var leftHand: Bool = UserDefaults.standard.bool(forKey: "leftHand")
    @State private var showAlert = false
    @State private var settingsOptions: [DataMetadata] = []
    @State private var showConfirm = false
    @State private var deletionData: (String, String) = ("", "")
    @State private var showPitScoutingCover: Bool = false
    @EnvironmentObject var controller: ScoutingController
    
    var body: some View {
        NavigationView {
            VStack {
                Form {
                    Section {
                        Picker("Event Code", selection: $eventCodeInput) {
                            if !settingsOptions.isEmpty {
                                ForEach(settingsOptions[0].events, id: \.self) { event_code in
                                    Text(event_code)
                                        .tag(event_code)
                                }
                            } else {
                                Text(eventCodeInput)
                                    .tag(eventCodeInput)
                            }
                        }
                        .pickerStyle(.menu)
                        .onChange(of: eventCodeInput) { _ in
                            UserDefaults.standard.set(eventCodeInput, forKey: "eventCode")
                            controller.matchNumber = 0
                            controller.teamNumber = "--"
                            controller.getMatches { result in
                                controller.matchList = result
                            }
                        }
                        Picker("Season", selection: $seasonInput) {
                            Text("2025").tag("2025")
                        }
                        .pickerStyle(.menu)
                        .onChange(of: seasonInput) { _ in
                            saveSeason()
                            controller.matchNumber = 0
                            controller.teamNumber = "--"
                            controller.getMatches { result in
                                controller.matchList = result
                            }
                        }
                        Toggle("Dark Mode", isOn: $darkMode)
                            .onChange(of: darkMode) { _ in
                                UserDefaults.standard.set(darkMode, forKey: "darkMode")
                                showAlert = true
                            }
//                        Toggle("Left-Handed Labels", isOn: $leftHand)
//                            .onChange(of: leftHand) { _ in
//                                UserDefaults.standard.set(leftHand, forKey: "leftHand")
//                            }
                    }
                    Section {
                        Picker("Game Interface", selection: $controller.selectedGameInterface) {
                            Text("Slider").tag(0)
                            Text("Buttons").tag(1)
                        }
                        .pickerStyle(.menu)
                        .onChange(of: controller.selectedGameInterface) { _ in
                            UserDefaults.standard.set(controller.selectedGameInterface, forKey: "gameInterface2025")
                        }
                    }
                    Section {
                        Button(action: {
                            showPitScoutingCover.toggle()
                        }, label: {
                            Label("Pit Scouting", systemImage: "wrench.adjustable").labelStyle(.titleOnly)
                        })
                    }
                    .fullScreenCover(isPresented: $showPitScoutingCover) {
                        PitScouting()
                    }
                    Section {
                        NavigationLink(destination: RegionalPoints().navigationTitle("Regional Points"), label: { Label("Regional Points Calculator", systemImage: "arrow.forward").labelStyle(.titleOnly) })
                        // Link("Scouting Tutorial Video", destination: URL(string: "https://jayagra.com/scouting_")!)
                        Link("Scouting Tutorial Video", destination: URL(string: "https://jayagra.com/static-ish/bearTracks-2025_Standard.mov")!)
                    }
                    Section {
                        Button("Clear Network Cache") {
                            UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
                            URLCache.shared.removeAllCachedResponses()
                        }
                        Button("Log Out") {
                            if let cookies = HTTPCookieStorage.shared.cookies(
                                for: sharedSession.configuration.urlCache?.cachedResponse(
                                    for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(
                                        string: "https://beartracks.io")!)
                            {
                                for cookie in cookies {
                                    sharedSession.configuration.httpCookieStorage?.deleteCookie(cookie)
                                }
                                controller.loginRequired = 2
                            }
                        }
                        .foregroundStyle(Color.pink)
                    }
                    Section {
                        Button("Delete Account") {
                            showConfirm = true
                        }
                        .foregroundStyle(Color.pink)
                    }
                    Section {
                        Text(
                            "This application is used to submit scouting data to bearTracks. To view this data, install the [data viewer](https://apps.apple.com/us/app/beartracks-data/id6475752596). The data viewer may only be used by users registered with a team (i.e. team code was not 00000). Team registration is free- to register your team or add yourself to a team after account creation, send an email to [admin@beartracks.io](mailto:admin@beartracks.io)."
                        )
                        .font(.footnote)
                    }
                }
            }
            .navigationTitle("Settings")
            .alert(
                isPresented: $showAlert,
                content: {
                    Alert(
                        title: Text("Theme Change"),
                        message: Text("An app restart is required for the theme change to take effect"),
                        dismissButton: .default(Text("ok"))
                    )
                }
            )
            .alert(
                "Confirm Deletion", isPresented: $showConfirm,
                actions: {
                    TextField("Username", text: $deletionData.0)
                    SecureField("Password", text: $deletionData.1)
                    Button(
                        "Cancel", role: .cancel,
                        action: {
                            showConfirm = false
                        })
                    Button(
                        "Delete", role: .destructive,
                        action: {
                            deleteAccount(data: ["username": deletionData.0, "password": deletionData.1])
                            controller.loginRequired = 2
                            showConfirm = false
                        })
                },
                message: {
                    Text("**This action is irreversible.**")
                })
        }
        .onAppear {
            loadSettingsJson { result in
                self.settingsOptions = result
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    func saveSeason() {
        UserDefaults.standard.set(seasonInput, forKey: "season")
    }
    
    func loadSettingsJson(completionBlock: @escaping ([DataMetadata]) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/data") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(DataMetadata.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock([result])
                    }
                } catch {
                    print("parse error")
                    completionBlock([])
                }
            } else if let error = error {
                print("fetch error: \(error)")
                completionBlock([])
            }
        }
        requestTask.resume()
    }
    
    private func deleteAccount(data: [String: String]) {
        guard let url = URL(string: "https://beartracks.io/api/v1/auth/delete") else { return }
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            sharedSession.dataTask(with: request) { data, response, error in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                        } else {
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
                        }
                    }
                } else {
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                }
            }.resume()
        } catch {
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }
    }
}

struct SettingsView_Preview: PreviewProvider {
    @State static var loginReq = false
    static var previews: some View {
        SettingsView()
    }
}

struct DataMetadata: Codable {
    let seasons: [String]
    let events: [String]
    let teams: [String]
}

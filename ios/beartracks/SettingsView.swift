//
//  SettingsView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

/// Settings window for event config & logging out
struct SettingsView: View {
    @State private var teamNumberInput: String = UserDefaults.standard.string(forKey: "teamNumber") ?? ""
    @State private var eventCodeInput: String = UserDefaults.standard.string(forKey: "eventCode") ?? ""
    @State private var seasonInput: String = UserDefaults.standard.string(forKey: "season") ?? ""
    @State private var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @State private var showAlert = false
    @State private var settingsOptions: [DataMetadata] = []
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationStack {
            VStack {
                Form {
                    Section {
                        Picker("Team Number", selection: $teamNumberInput) {
                            if !settingsOptions.isEmpty {
                                ForEach(settingsOptions[0].teams, id: \.self) { team in
                                    Text(team)
                                        .tag(team)
                                }
                            } else {
                                Text(teamNumberInput)
                                    .tag(teamNumberInput)
                            }
                        }
                        .pickerStyle(.menu)
                        .onChange(of: teamNumberInput) { value in
                            UserDefaults.standard.set(teamNumberInput, forKey: "teamNumber")
                        }
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
                        .onChange(of: eventCodeInput) { value in
                            UserDefaults.standard.set(eventCodeInput, forKey: "eventCode")
                        }
                        Picker("Season", selection: $seasonInput) {
                            if !settingsOptions.isEmpty {
                                ForEach(settingsOptions[0].seasons, id: \.self) { season in
                                    Text(season)
                                        .tag(season)
                                }
                            } else {
                                Text(seasonInput)
                                    .tag(seasonInput)
                            }
                        }
                        .pickerStyle(.menu)
                        .onChange(of: seasonInput) { value in
                            UserDefaults.standard.set(seasonInput, forKey: "season")
                        }
                        Toggle("Dark Mode", isOn: $darkMode)
                        .onChange(of: darkMode) { value in
                            UserDefaults.standard.set(darkMode, forKey: "darkMode")
                            showAlert = true
                        }
                    }
                    Section {
                        Button("Clear Cache") {
                            URLCache.shared.removeAllCachedResponses()
                        }
                        Button("Log Out") {
                            if let cookies = HTTPCookieStorage.shared.cookies(for: sharedSession.configuration.urlCache?.cachedResponse(for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(string: "https://beartracks.io")!) {
                                for cookie in cookies {
                                    sharedSession.configuration.httpCookieStorage?.deleteCookie(cookie)
                                }
                                appState.loginRequired = true
                            }
                        }
                        .foregroundStyle(Color.pink)
                    }
                    Text("To delete or update account information, please email [admin@beartracks.io](mailto:admin@beartracks.io).")
                        .font(.footnote)
                }
                Spacer()
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
        .onAppear() {
            loadSettingsJson { result in
                self.settingsOptions = result
            }
        }
    }
    
    func loadSettingsJson(completionBlock: @escaping ([DataMetadata]) -> Void) -> Void {
        guard let url = URL(string: "https://beartracks.io/api/v1/data") else {
            return
        }
        
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
}

struct SettingsView_Preview: PreviewProvider {
    @State static var loginReq = false
    static var previews: some View {
        SettingsView()
    }
}

/// Data structure of the metadata call to bearTracks API.
/// > Used to provide season, event, and team options
struct DataMetadata: Codable {
    let seasons: [String]
    let events: [String]
    let teams: [String]
}

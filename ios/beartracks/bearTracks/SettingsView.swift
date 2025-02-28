//
//  SettingsView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct SettingsView: View {
    @State private var teamNumberInput: String = UserDefaults().string(forKey: "teamNumber") ?? ""
    @State private var eventCodeInput: String = UserDefaults().string(forKey: "eventCode") ?? ""
    @State private var seasonInput: String = UserDefaults().string(forKey: "season") ?? ""
    @State private var darkMode: Bool = UserDefaults().bool(forKey: "darkMode")
    @State private var allData: Bool = UserDefaults().bool(forKey: "useAllCompData")
    @State private var showAlert = false
    @State private var settingsOptions: [DataMetadata] = []
    @State private var showConfirm = false
    @State private var deletionData: (String, String) = ("", "")
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        NavigationView {
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
#if !os(watchOS)
                    .pickerStyle(.menu)
#endif
                    .onChange(of: teamNumberInput) { value in
                        UserDefaults().set(teamNumberInput, forKey: "teamNumber")
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
#if !os(watchOS)
                    .pickerStyle(.menu)
#endif
                    .onChange(of: eventCodeInput) { value in
                        UserDefaults().set(eventCodeInput, forKey: "eventCode")
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
#if !os(watchOS)
                    .pickerStyle(.menu)
#endif
                    .onChange(of: seasonInput) { value in
                        UserDefaults().set(
                            seasonInput, forKey: "season")
                    }
                }
                Section {
#if !os(watchOS)
                    Toggle("Use all data for match predictions. This setting can be useful for the early matches of a competition, but is **not reccomended beyond the halfway point** unless prediction data is extremely inaccurate.", isOn: $allData)
                        .onChange(of: allData) { value in
                            UserDefaults().set(allData, forKey: "useAllCompData")
                        }
#endif
                    Toggle("Dark Mode", isOn: $darkMode)
                        .onChange(of: darkMode) { value in
                            UserDefaults().set(darkMode, forKey: "darkMode")
                            showAlert = true
                        }
                }
#if !os(watchOS)
                Section {
                    NavigationLink(destination: RegionalPoints(), label: { Label("Regional Points Calculator", systemImage: "arrow.forward").labelStyle(.titleOnly) })
                }
#endif
                Section {
                    Button("Clear Cache") {
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
                            appState.loginRequired = true
                        }
                    }
                    .foregroundColor(Color.pink)
                }
                Section {
                    Button("Delete Account") {
                        showConfirm = true
                    }
                    .foregroundStyle(Color.pink)
                }
            }
#if !os(watchOS)
            .navigationTitle("Settings")
#endif
            .alert(
                isPresented: $showAlert,
                content: {
                    Alert(
                        title: Text("Theme Change"),
                        message: Text("An app restart is required for the theme change to take effect."),
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
                            appState.loginRequired = true
                            showConfirm = false
                        })
                },
                message: {
                    Text("This action is irreversible.")
                }
            )
            .onAppear {
                loadSettingsJson { result in
                    self.settingsOptions = result
                }
            }
#if os(watchOS)
            .ignoresSafeArea(edges: .bottom)
#endif
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    func loadSettingsJson(completionBlock: @escaping ([DataMetadata]) -> Void) {
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
                    print("Parse error")
                    completionBlock([])
                }
            } else if let error = error {
                print("Fetch error: \(error)")
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
#if !os(visionOS) && !os(watchOS) && !os(tvOS)
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
#endif
                        } else {
#if !os(visionOS) && !os(watchOS) && !os(tvOS)
                            UINotificationFeedbackGenerator().notificationOccurred(.error)
#endif
                        }
                    }
                } else {
#if !os(visionOS) && !os(watchOS) && !os(tvOS)
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
#endif
                }
            }.resume()
        } catch {
#if !os(visionOS) && !os(watchOS) && !os(tvOS)
            UINotificationFeedbackGenerator().notificationOccurred(.error)
#endif
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

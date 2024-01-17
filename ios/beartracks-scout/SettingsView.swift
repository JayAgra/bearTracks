//
//  SettingsView.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

struct SettingsView: View {
    @State private var eventCodeInput: String = UserDefaults.standard.string(forKey: "eventCode") ?? ""
    @State private var seasonInput: String = UserDefaults.standard.string(forKey: "season") ?? ""
    @State private var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @State private var showAlert = false
    @State private var settingsOptions: [DataMetadata] = []
    @Binding var loginRequired: Bool
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack {
                    HStack {
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
                        .padding()
                        Spacer()
                        Button("Save") {
                            saveEventCode()
                        }
                        .padding()
                    }
                    HStack {
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
                        .onChange(of: darkMode) { _ in
                            UserDefaults.standard.set(darkMode, forKey: "darkMode")
                            showAlert = true
                        }
                    }
                    HStack {
                        Button("Log Out") {
                            if let cookies = HTTPCookieStorage.shared.cookies(for: sharedSession.configuration.urlCache?.cachedResponse(for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(string: "https://beartracks.io")!) {
                                for cookie in cookies {
                                    sharedSession.configuration.httpCookieStorage?.deleteCookie(cookie)
                                }
                                loginRequired = true
                            }
                        }
                        .foregroundStyle(Color.pink)
                        .buttonStyle(.bordered)
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
        .onAppear() {
            loadSettingsJson { result in
                self.settingsOptions = result
            }
        }
    }
    
    func saveEventCode() {
        UserDefaults.standard.set(eventCodeInput, forKey: "eventCode")
    }
    
    func saveSeason() {
        UserDefaults.standard.set(seasonInput, forKey: "season")
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
        SettingsView(loginRequired: $loginReq)
    }
}

struct DataMetadata: Codable {
    let seasons: [String]
    let events: [String]
    let teams: [String]
}

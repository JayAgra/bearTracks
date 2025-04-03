//
//  SettingsView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import ActivityKit
import SwiftUI

struct SettingsView: View {
    @Binding var loginRequired: Bool
    @State private var settingsOptions: [DataMetadata] = []
    @State private var eventCode = "TEST"
    @State private var season = "2025"
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack {
                    VStack {
                        Button("Activity") {
                            if ActivityAuthorizationInfo().areActivitiesEnabled {
                                    self.fetchStatusJson { (status) in
                                        do {
                                        let activity = try Activity.request(
                                            attributes: SystemStatusAttributes(hostname: "beartracks.io"),
                                            content: .init(state: SystemStatusAttributes.ContentState(total_mem: status?.total_mem_kb ?? 1, used_mem: status?.used_mem_kb ?? 1, total_swap: status?.total_swap_kb ?? 1, used_swap: status?.used_swap_kb ?? 1, uptime: status?.uptime_sec ?? 1, load_one: status?.load_avg_one ?? 1.0, load_five: status?.load_avg_five ?? 1.0, load_fifteen: status?.load_avg_one ?? 1.0, sessions: status?.sessions_size ?? 1), staleDate: nil),
                                            pushType: nil
                                        )
                                        } catch {}
                                    }
                            }
                        }
                        
                        Button("Refresh FRC API Data Season") {
                            guard let url = URL(string: "https://beartracks.io/api/v1/manage/refresh_cache/true") else { return }
                            var request = URLRequest(url: url)
                            request.httpMethod = "GET"
                            request.httpShouldHandleCookies = true
                            
                            let requestTask = sharedSession.dataTask(with: request) {
                                (data: Data?, response: URLResponse?, error: Error?) in
                                if let data = data {
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                } else if let error = error {
                                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                                }
                            }
                            requestTask.resume()
                        }
                        .buttonStyle(.bordered).padding()
                        
                        Button("Refresh FRC API Data All") {
                            guard let url = URL(string: "https://beartracks.io/api/v1/manage/refresh_cache/false") else { return }
                            var request = URLRequest(url: url)
                            request.httpMethod = "GET"
                            request.httpShouldHandleCookies = true
                            
                            let requestTask = sharedSession.dataTask(with: request) {
                                (data: Data?, response: URLResponse?, error: Error?) in
                                if let data = data {
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                } else if let error = error {
                                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                                }
                            }
                            requestTask.resume()
                        }
                        .buttonStyle(.bordered).padding()
                        
                        Picker("Event Code", selection: $eventCode) {
                            if !settingsOptions.isEmpty {
                                ForEach(settingsOptions[0].events, id: \.self) { event_code in
                                    Text(event_code)
                                        .tag(event_code)
                                }
                            } else {
                                Text(eventCode)
                                    .tag(eventCode)
                            }
                        }
                        .pickerStyle(.menu)
                        Picker("Season", selection: $season) {
                            Text("2025").tag("2025")
                        }
                        .pickerStyle(.menu)
                        
                        Button("Thank Scouts (dont misclick)") {
                            guard let url = URL(string: "https://beartracks.io/api/v1/manage/notify/thank_scouts/\(season)/\(eventCode)/0") else { return }
                            var request = URLRequest(url: url)
                            request.httpMethod = "GET"
                            request.httpShouldHandleCookies = true
                            
                            let requestTask = sharedSession.dataTask(with: request) {
                                (data: Data?, response: URLResponse?, error: Error?) in
                                if let data = data {
                                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                                } else if let error = error {
                                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                                }
                            }
                            requestTask.resume()
                        }
                        .buttonStyle(.bordered).padding()
                        
                        Button("Log Out") {
                            if let cookies = HTTPCookieStorage.shared.cookies(
                                for: sharedSession.configuration.urlCache?.cachedResponse(
                                    for: URLRequest(url: URL(string: "https://beartracks.io")!))?.response.url ?? URL(
                                        string: "https://beartracks.io")!)
                            {
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
            .onAppear {
                loadSettingsJson { result in
                    self.settingsOptions = result
                }
            }
        }
    }
    
    private func fetchStatusJson(completionBlock: @escaping (StatusData?) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/debug/system") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(StatusData.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    completionBlock(nil)
                }
            } else if let error = error {
                print("fetch error: \(error)")
                completionBlock(nil)
            }
        }
        requestTask.resume()
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
}

struct SettingsView_Preview: PreviewProvider {
    @State static var loginReq = false
    static var previews: some View {
        SettingsView(loginRequired: $loginReq)
    }
}

struct StatusData: Codable {
    let team, hostname: String
    let total_mem_kb, used_mem_kb, total_swap_kb, used_swap_kb, last_boot_time_sec, uptime_sec: Int
    let load_avg_one, load_avg_five, load_avg_fifteen: Double
    let sessions_size: Int
}

struct DataMetadata: Codable {
    let seasons: [String]
    let events: [String]
    let teams: [String]
}

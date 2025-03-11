//
//  beartracksApp.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI
import UserNotifications

public enum Tab {
  case teams, matches, data, settings
}

@main
struct beartracksApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults().bool(forKey: "darkMode")
    @StateObject public var appState = AppState()
    let notificationCenter = UNUserNotificationCenter.current()
    @UIApplicationDelegateAdaptor private var appDelegate: NotificationDelegate
    
    var body: some Scene {
        WindowGroup {
            if !appState.loginRequired {
#if targetEnvironment(macCatalyst)
                NavigationView {
                    List(selection: $appState.selectedTab) {
                        Label("Teams", systemImage: "list.number")
                            .tag(Tab.teams)
                        Label("Matches", systemImage: "calendar")
                            .tag(Tab.matches)
                        Label("Data", systemImage: "magnifyingglass")
                            .tag(Tab.data)
                        Label("Settings", systemImage: "gear")
                            .tag(Tab.settings)
                    }
                    .navigationTitle("bearTracks")
                    switch appState.selectedTab {
                    case .teams:
                        Teams()
                            .environmentObject(appState)
                            .navigationTitle("Teams")
                    case .matches:
                        MatchList()
                            .environmentObject(appState)
                            .navigationTitle("Matches")
                    case .data:
                        DataView()
                            .environmentObject(appState)
                            .navigationTitle("Data")
                    case .settings:
                        SettingsView()
                            .environmentObject(appState)
                            .navigationTitle("Settings")
                    case nil:
                        LoginView()
                            .environmentObject(appState)
                    }
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    appState.checkLoginState()
                    Task {
                        do {
                            try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
                        } catch {
                            print("failed to request notification auth")
                        }
                    }
                    appDelegate.app = self
                }
                .environmentObject(appState)
#endif
#if !targetEnvironment(macCatalyst)
                TabView(selection: $appState.selectedTab) {
                    Teams()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Teams", systemImage: "list.number")
                        }
                        .tag(Tab.teams)
                    MatchList()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Matches", systemImage: "calendar")
                        }
                        .tag(Tab.matches)
                    DataView()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Data", systemImage: "magnifyingglass")
                        }
                        .tag(Tab.data)
                    SettingsView()
                        .environmentObject(appState)
                        .tabItem {
                            Label("Settings", systemImage: "gear")
                        }
                        .tag(Tab.settings)
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    appState.checkLoginState()
#endif
#if os(iOS)
                    Task {
                        do {
                            try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
                        } catch {
                            print("failed to request notification auth")
                        }
                    }
                    appDelegate.app = self
#endif
#if !targetEnvironment(macCatalyst)
                }
                .environmentObject(appState)
#endif
            } else {
                LoginView()
                    .environmentObject(appState)
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .onAppear {
                        appState.checkLoginState()
                    }
            }
        }
    }
}

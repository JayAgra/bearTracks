//
//  beartracksApp.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

public enum Tab {
  case teams, matches, data, settings
}

@main
struct beartracksApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool =
    UserDefaults(suiteName: "group.com.jayagra.beartracks")?.bool(forKey: "darkMode") ?? true
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            if !appState.loginRequired {
#if targetEnvironment(macCatalyst)
                NavigationView {
                    List(selection: $appState.selectedTab) {
                        Label("teams", systemImage: "list.number")
                            .tag(Tab.teams)
                        Label("matches", systemImage: "calendar")
                            .tag(Tab.matches)
                        Label("data", systemImage: "magnifyingglass")
                            .tag(Tab.data)
                        Label("settings", systemImage: "gear")
                            .tag(Tab.settings)
                    }
                    .navigationTitle("bearTracks")
                    switch appState.selectedTab {
                    case .teams:
                        Teams()
                    case .matches:
                        MatchList()
                    case .data:
                        DataView()
                    case .settings:
                        SettingsView()
                            .environmentObject(appState)
                    case nil:
                        LoginView()
                            .environmentObject(appState)
                    }
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    checkLoginState { isLoggedIn in
                        appState.loginRequired = !isLoggedIn
                    }
                }
                .environmentObject(appState)
#else
                TabView(selection: $appState.selectedTab) {
                    Teams()
                        .tabItem {
                            Label("teams", systemImage: "list.number")
                        }
                        .tag(Tab.teams)
                    MatchList()
                        .tabItem {
                            Label("matches", systemImage: "calendar")
                        }
                        .tag(Tab.matches)
                    DataView()
                        .tabItem {
                            Label("data", systemImage: "magnifyingglass")
                        }
                        .tag(Tab.data)
                    SettingsView()
                        .environmentObject(appState)
                        .tabItem {
                            Label("settings", systemImage: "gear")
                        }
                        .tag(Tab.settings)
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    checkLoginState { isLoggedIn in
                        appState.loginRequired = !isLoggedIn
                    }
                }
                .environmentObject(appState)
#endif
            } else {
                LoginView()
                    .environmentObject(appState)
                    .preferredColorScheme(darkMode ? .dark : .light)
            }
        }
    }
}

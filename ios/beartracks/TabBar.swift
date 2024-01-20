//
//  TabBar.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

/// Primary navigaion element.
///
/// - iOS
///     - Uses `TabBar` view. All views called by the `TabBar` use `NavigationStack`
/// - Mac Catalyst
///     - Uses a `NavigationSplitView` with a standard  `List` sidebar and a content area made up of `NavigationStack` views. Some of the `NavigationStack`views will call child views the manner as the iOS app.
struct TabBar: View {
    enum Tab {
        case teams, matches, data, settings
    }
    @State private var selectedTab: Tab? = .teams
    @State private var loginRequired: Bool = false

    var body: some View {
        #if targetEnvironment(macCatalyst)
        NavigationSplitView(sidebar: {
            List(selection: $selectedTab) {
                NavigationLink(value: Tab.teams) {
                    Label("teams", systemImage: "list.number")
                }
                NavigationLink(value: Tab.matches) {
                    Label("matches", systemImage: "calendar")
                }
                NavigationLink(value: Tab.data) {
                    Label("data", systemImage: "magnifyingglass")
                }
                NavigationLink(value: Tab.settings) {
                    Label("settings", systemImage: "gear")
                }
            }
            .navigationTitle("bearTracks")
            .onAppear() {
                checkLoginState { isLoggedIn in
                    loginRequired = !isLoggedIn
                }
            }
            .sheet(isPresented: $loginRequired, onDismiss: {
                loginRequired = false
                checkLoginState { isLoggedIn in
                    loginRequired = !isLoggedIn
                }
            }) {
                LoginView()
            }
        }, detail: {
            switch selectedTab {
            case .teams:
                Teams()
            case .matches:
                MatchList()
            case .data:
                DataView()
            case .settings:
                SettingsView(loginRequired: $loginRequired)
            case nil:
                LoginView()
            }
        })
        #else
        TabView(selection: $selectedTab) {
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
            SettingsView(loginRequired: $loginRequired)
                .tabItem {
                    Label("settings", systemImage: "gear")
                }
                .tag(Tab.settings)
        }
        .onAppear() {
            checkLoginState { isLoggedIn in
                loginRequired = !isLoggedIn
            }
        }
        .sheet(isPresented: $loginRequired, onDismiss: {
            loginRequired = false
            checkLoginState { isLoggedIn in
                loginRequired = !isLoggedIn
            }
        }) {
            LoginView()
        }
        #endif
    }
}

#Preview {
    TabBar()
}

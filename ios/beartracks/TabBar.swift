//
//  TabBar.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct TabBar: View {
    enum Tab {
        case teams, matches, /* scout ,*/ data, settings
    }
    @State private var selectedTab: Tab = .teams
    @State private var loginRequired: Bool = false

    var body: some View {
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
            /*
             ScoutView()
                .tabItem {
                    Label("scout", systemImage: "eyes")
                }
                .tag(Tab.scout)
            */
            DataView()
                .tabItem {
                    Label("data", systemImage: "magnifyingglass")
                }
                .tag(Tab.data)
            SettingsView()
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
    }
}

#Preview {
    TabBar()
}

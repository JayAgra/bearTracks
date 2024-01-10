//
//  TabBar.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct TabBar: View {
    enum Tab {
        case teams, matches, data, settings
    }
    @State private var selectedTab: Tab = .teams

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
    }
}

#Preview {
    TabBar()
}

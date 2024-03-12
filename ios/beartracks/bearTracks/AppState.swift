//
//  AppState.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/7/24.
//

import Combine
import Foundation

class AppState: ObservableObject {
#if targetEnvironment(macCatalyst)
    @Published public var selectedTab: Tab? = .teams
#elseif os(watchOS)
#else
    @Published public var selectedTab: Tab = .teams
#endif
    @Published public var loginRequired: Bool = false
    @Published public var matchJson: [Match] = []
    private var cancellables: Set<AnyCancellable> = []
    
#if !os(watchOS)
    init() {
        $selectedTab
            .receive(on: DispatchQueue.main)
            .sink { _ in }
            .store(in: &cancellables)
    }
#endif
}

/// FRC API's Schedule structure
struct MatchData: Codable {
    let Schedule: [Match]
}

/// FRC API's Match structure
struct Match: Codable, Identifiable {
    var id = UUID()
    let description: String
    let startTime: String
    let matchNumber: Int
    let field: String
    let tournamentLevel: String
    let teams: [Team]
    
    private enum CodingKeys: String, CodingKey {
        case description, startTime, matchNumber, field, tournamentLevel, teams
    }
}

/// FRC API's Team structure
struct Team: Codable, Identifiable {
    var id = UUID()
    let teamNumber: Int
    let station: String
    let surrogate: Bool
    private enum CodingKeys: String, CodingKey {
        case teamNumber, station, surrogate
    }
}

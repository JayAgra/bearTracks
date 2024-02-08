//
//  AppState.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/7/24.
//

import Foundation
import Combine

class AppState: ObservableObject {
#if targetEnvironment(macCatalyst)
    @Published public var selectedTab: Tab? = .teams
#else
    @Published public var selectedTab: Tab = .teams
#endif
    @Published public var loginRequired: Bool = false
    
    private var cancellables: Set<AnyCancellable> = []

    init() {
        $selectedTab
            .receive(on: DispatchQueue.main)
            .sink { _ in }
            .store(in: &cancellables)
    }
}

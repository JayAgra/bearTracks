//
//  MatchListModel.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation

class MatchListModel: ObservableObject {
    @Published private(set) var selectedItem: String = "-1"
        
    func setSelectedItem(item: String) {
        self.selectedItem = item
    }
    
    func getSelectedItem() -> String {
        return self.selectedItem
    }
}

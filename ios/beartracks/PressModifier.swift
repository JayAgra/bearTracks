//
//  PressModifier.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/12/24.
//

import Foundation
import SwiftUI

struct PressModifier: ViewModifier {
    var onPress: () -> Void
    var onRelease: () -> Void
    
    func body(content: Content) -> some View {
        content
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged({ _ in
                        onPress()
                    })
                    .onEnded({ _ in
                        onRelease()
                    })
            )
    }
}

' =======================================================================
' Day 8 – Fall of the Nationalists & Founding the PRC (1946–49)
' PowerPoint VBA Macro
'
' HOW TO USE:
' 1. Open Microsoft PowerPoint
' 2. Press Alt+F11 to open the VBA Editor
' 3. Insert > Module
' 4. Paste this entire file
' 5. Press F5 (or Run > Run Sub) to execute BuildDay8Presentation
' =======================================================================

Sub BuildDay8Presentation()
    
    Dim prs As Presentation
    Set prs = Application.Presentations.Add
    prs.PageSetup.SlideWidth = 13.333 * 72  ' 16:9 widescreen in points
    prs.PageSetup.SlideHeight = 7.5 * 72
    
    Dim sw As Single: sw = prs.PageSetup.SlideWidth
    Dim sh As Single: sh = prs.PageSetup.SlideHeight
    
    ' ─── Color Constants (RGB) ───
    Dim BG_DARK As Long: BG_DARK = RGB(26, 26, 30)
    Dim BG_SLIDE As Long: BG_SLIDE = RGB(34, 34, 40)
    Dim TEXT_PRI As Long: TEXT_PRI = RGB(240, 235, 227)
    Dim TEXT_SEC As Long: TEXT_SEC = RGB(192, 187, 178)
    Dim ACCENT_RED As Long: ACCENT_RED = RGB(192, 57, 43)
    Dim ACCENT_RED_LT As Long: ACCENT_RED_LT = RGB(231, 76, 60)
    Dim ACCENT_GOLD As Long: ACCENT_GOLD = RGB(212, 168, 83)
    Dim ACCENT_GOLD_LT As Long: ACCENT_GOLD_LT = RGB(240, 214, 138)
    Dim WHITE As Long: WHITE = RGB(255, 255, 255)
    Dim BLACK As Long: BLACK = RGB(0, 0, 0)
    
    ' Connections colors
    Dim CONN_YELLOW As Long: CONN_YELLOW = RGB(241, 196, 15)
    Dim CONN_GREEN As Long: CONN_GREEN = RGB(125, 206, 160)
    Dim CONN_BLUE As Long: CONN_BLUE = RGB(111, 168, 220)
    Dim CONN_PURPLE As Long: CONN_PURPLE = RGB(187, 143, 206)
    Dim CONN_UNSOLVED As Long: CONN_UNSOLVED = RGB(58, 58, 66)
    
    ' Work Time colors
    Dim WT_ORANGE As Long: WT_ORANGE = RGB(230, 126, 34)
    Dim WT_GRAY As Long: WT_GRAY = RGB(127, 140, 141)
    Dim WT_GOLD As Long: WT_GOLD = RGB(241, 196, 15)
    Dim WT_BLUE As Long: WT_BLUE = RGB(93, 173, 226)
    Dim WT_GREEN As Long: WT_GREEN = RGB(39, 174, 96)
    
    Dim sld As Slide
    Dim shp As Shape
    Dim tf As TextFrame
    Dim tr As TextRange
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 1: TITLE
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(1, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_DARK
    
    ' Top accent bar
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    ' DAY 8 badge
    Set shp = sld.Shapes.AddShape(msoShapeRectangle, InPt(5.5), InPt(2#), InPt(2.3), InPt(0.5))
    shp.Fill.Solid
    shp.Fill.ForeColor.RGB = ACCENT_RED
    shp.Line.Visible = msoFalse
    shp.TextFrame.TextRange.Text = "DAY 8"
    FormatText shp.TextFrame.TextRange, 16, WHITE, True, "Calibri"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    shp.TextFrame.VerticalAnchor = msoAnchorMiddle
    
    ' Title
    Set shp = AddTextBox(sld, 1.5, 2.8, 10.3, 2#, _
        "Fall of the Nationalists and" & vbCrLf & "Founding the People's Republic of China")
    FormatText shp.TextFrame.TextRange, 38, TEXT_PRI, True, "Georgia"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    
    ' Date range
    Set shp = AddTextBox(sld, 4#, 4.8, 5.3, 0.8, "1946 – 49")
    FormatText shp.TextFrame.TextRange, 32, ACCENT_GOLD, True, "Georgia"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    
    ' Subtitle
    Set shp = AddTextBox(sld, 4#, 5.7, 5.3, 0.5, "March 17/A  –  March 18/B")
    FormatText shp.TextFrame.TextRange, 14, TEXT_SEC, False, "Calibri"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 2: AGENDA
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(2, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    ' Title
    Set shp = AddTextBox(sld, 0.7, 0.4, 12#, 0.7, _
        "Day 8 – Fall of Nationalists and Founding of the People's Republic of China")
    FormatText shp.TextFrame.TextRange, 28, TEXT_PRI, True, "Georgia"
    Call AddBar(sld, InPt(0.7), InPt(1.1), InPt(1.2), 3, ACCENT_GOLD)
    
    ' Objective card
    Call AddCard(sld, 0.7, 1.6, 5.8, 2.2, RGB(40, 40, 48), RGB(58, 58, 66))
    Call AddBar(sld, InPt(0.7), InPt(1.6), 5, InPt(2.2), ACCENT_RED)
    Set shp = AddTextBox(sld, 1#, 1.75, 5.2, 0.4, "OBJECTIVE")
    FormatText shp.TextFrame.TextRange, 16, ACCENT_GOLD, True, "Calibri"
    Set shp = AddTextBox(sld, 1#, 2.2, 5.2, 1.4, _
        "• I can analyze multiple and complex causes of the success of the CCP in the Chinese Civil War." & vbCrLf & _
        "• I can develop a precise and knowledgeable thesis statement")
    FormatText shp.TextFrame.TextRange, 14, TEXT_SEC, False, "Calibri"
    
    ' Agenda card
    Call AddCard(sld, 6.8, 1.6, 5.8, 2.2, RGB(40, 40, 48), RGB(58, 58, 66))
    Call AddBar(sld, InPt(6.8), InPt(1.6), 5, InPt(2.2), ACCENT_GOLD)
    Set shp = AddTextBox(sld, 7.1, 1.75, 5.2, 0.4, "AGENDA")
    FormatText shp.TextFrame.TextRange, 16, ACCENT_GOLD, True, "Calibri"
    Set shp = AddTextBox(sld, 7.1, 2.2, 5.2, 1.4, _
        "• Warm-up: CCW Connections" & vbCrLf & _
        "• Notes: The impact of WWII on the CCW" & vbCrLf & _
        "• Developing a Complex Thesis statement Review" & vbCrLf & _
        "• What Caused the Success of the CCP Document Set")
    FormatText shp.TextFrame.TextRange, 14, TEXT_SEC, False, "Calibri"
    
    ' Homework card
    Call AddCard(sld, 0.7, 4.2, 11.9, 2.5, RGB(40, 40, 48), RGB(58, 58, 66))
    Call AddBar(sld, InPt(0.7), InPt(4.2), 5, InPt(2.5), ACCENT_GOLD_LT)
    Set shp = AddTextBox(sld, 1#, 4.35, 5.2, 0.4, "HOMEWORK")
    FormatText shp.TextFrame.TextRange, 16, ACCENT_GOLD, True, "Calibri"
    Set shp = AddTextBox(sld, 1#, 4.8, 11.3, 1.5, _
        "• Have your source for Entry 5 ready for next class (Reassessment)" & vbCrLf & _
        "• Next two classes will workdays" & vbCrLf & _
        "• Final Project due at the start of class on April 9/10")
    FormatText shp.TextFrame.TextRange, 14, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDES 3-7: CONNECTIONS
    ' ═══════════════════════════════════════════════════
    ' We'll build all 5 reveal states
    
    Dim connData(0 To 4) As String ' pipe-delimited rows
    ' Slide 3: All unsolved
    Call BuildConnectionsSlide(prs, 3, BG_SLIDE, ACCENT_RED, TEXT_PRI, CONN_UNSOLVED, TEXT_PRI, _
        "Gangsters|Foreigners|Comintern|Kuomintang", _
        "Capitalists|GMD|Peasants|Land-owners", _
        "Gongchandang|Workers|Communists|Guomindang", _
        "Nationalists|The Chinese Communist Party|CCP|Soviet Union", _
        CONN_UNSOLVED, CONN_UNSOLVED, CONN_UNSOLVED, CONN_UNSOLVED, _
        TEXT_PRI, TEXT_PRI, TEXT_PRI, TEXT_PRI)
    
    ' Slide 4: Yellow solved
    Call BuildConnectionsSlide(prs, 4, BG_SLIDE, ACCENT_RED, TEXT_PRI, CONN_UNSOLVED, TEXT_PRI, _
        "CCP|Communists|Gongchandang|The Chinese Communist Party", _
        "Capitalists|GMD|Peasants|Land-owners", _
        "Comintern|Workers|Foreigners|Guomindang", _
        "Nationalists|Kuomintang|Gangsters|Soviet Union", _
        CONN_YELLOW, CONN_UNSOLVED, CONN_UNSOLVED, CONN_UNSOLVED, _
        BLACK, TEXT_PRI, TEXT_PRI, TEXT_PRI)
    
    ' Slide 5: Yellow + Green
    Call BuildConnectionsSlide(prs, 5, BG_SLIDE, ACCENT_RED, TEXT_PRI, CONN_UNSOLVED, TEXT_PRI, _
        "CCP|Communists|Gongchandang|The Chinese Communist Party", _
        "Nationalists|GMD|Kuomintang|Guomindang", _
        "Peasants|Foreigners|Comintern|Capitalists", _
        "Gangsters|Workers|Land-owners|Soviet Union", _
        CONN_YELLOW, CONN_GREEN, CONN_UNSOLVED, CONN_UNSOLVED, _
        BLACK, BLACK, TEXT_PRI, TEXT_PRI)
    
    ' Slide 6: Yellow + Green + Blue
    Call BuildConnectionsSlide(prs, 6, BG_SLIDE, ACCENT_RED, TEXT_PRI, CONN_UNSOLVED, TEXT_PRI, _
        "CCP|Communists|Gongchandang|The Chinese Communist Party", _
        "Nationalists|GMD|Kuomintang|Guomindang", _
        "Land-owners|Capitalists|Foreigners|Gangsters", _
        "Comintern|Peasants|Workers|Soviet Union", _
        CONN_YELLOW, CONN_GREEN, CONN_BLUE, CONN_UNSOLVED, _
        BLACK, BLACK, BLACK, TEXT_PRI)
    
    ' Slide 7: All solved
    Call BuildConnectionsSlide(prs, 7, BG_SLIDE, ACCENT_RED, TEXT_PRI, CONN_UNSOLVED, TEXT_PRI, _
        "CCP|Communists|Gongchandang|The Chinese Communist Party", _
        "Nationalists|GMD|Kuomintang|Guomindang", _
        "Land-owners|Capitalists|Foreigners|Gangsters", _
        "Peasants|Workers|Comintern|Soviet Union", _
        CONN_YELLOW, CONN_GREEN, CONN_BLUE, CONN_PURPLE, _
        BLACK, BLACK, BLACK, BLACK)
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 8: FOCUS QUESTION / PRC FOUNDING
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(8, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    Set shp = AddTextBox(sld, 0.7, 0.4, 12#, 0.7, "Founding of the People's Republic of China")
    FormatText shp.TextFrame.TextRange, 28, TEXT_PRI, True, "Georgia"
    Call AddBar(sld, InPt(0.7), InPt(1.1), InPt(1.2), 3, ACCENT_GOLD)
    
    ' Focus Question box
    Call AddCard(sld, 0.7, 1.5, 5.5, 1.4, RGB(48, 34, 34), ACCENT_RED)
    Call AddBar(sld, InPt(0.7), InPt(1.5), 5, InPt(1.4), ACCENT_RED)
    Set shp = AddTextBox(sld, 1#, 1.6, 5#, 0.3, "FOCUS QUESTION")
    FormatText shp.TextFrame.TextRange, 12, ACCENT_RED_LT, True, "Calibri"
    Set shp = AddTextBox(sld, 1#, 1.95, 5#, 0.8, _
        "What factors contributed to the success of the CCP and the downfall of the GMD?")
    FormatText shp.TextFrame.TextRange, 15, TEXT_PRI, False, "Georgia"
    shp.TextFrame.TextRange.Font.Italic = True
    
    ' Right side content
    Set shp = AddTextBox(sld, 6.7, 1.5, 6#, 5.5, _
        "• October 1st 1949: Founding of People's Republic of China (PRC)" & vbCrLf & _
        "    – ""Liberation"" – Mao Zedong gave a triumphant victory speech in Beijing while crowds cheered and watched a procession of the PLA and other party members." & vbCrLf & vbCrLf & _
        "• Chiang fled with remaining GMD army to Taiwan to found the Republic of China (ROC)" & vbCrLf & _
        "    – Claimed to be the legitimate Chinese government" & vbCrLf & _
        "    – Until 1971, Taiwan was recognized as the only legitimate government of China by the United Nations")
    FormatText shp.TextFrame.TextRange, 14, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 9: IMPACT OF WWII
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(9, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    ' Left red panel
    Call AddCard(sld, 0.5, 1.2, 3.5, 4.5, ACCENT_RED)
    Set shp = AddTextBox(sld, 0.7, 2.5, 3.1, 2#, _
        "The impact of" & vbCrLf & "WWII on the" & vbCrLf & "Chinese" & vbCrLf & "Civil War")
    FormatText shp.TextFrame.TextRange, 26, WHITE, True, "Georgia"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    
    ' Right content
    Set shp = AddTextBox(sld, 4.5, 1.5, 8.3, 5#, _
        "• CCP claimed they more effectively defended China from Japan, while the KMT efforts were described as ""half-hearted""" & vbCrLf & vbCrLf & _
        "• KMT received financial/military support from USA and Great Britain, which gave Chiang legitimacy, but also made him look like a sell out to the West" & vbCrLf & vbCrLf & _
        "• Chiang expected a long land war with US troops to buy him time to solidify his position against the CCP, which didn't happen after the atomic bomb.")
    FormatText shp.TextFrame.TextRange, 18, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 10: CIVIL WAR RESUMED
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(10, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    Set shp = AddTextBox(sld, 0.7, 0.4, 12#, 0.7, "The Chinese Civil War Resumed")
    FormatText shp.TextFrame.TextRange, 28, TEXT_PRI, True, "Georgia"
    Call AddBar(sld, InPt(0.7), InPt(1.1), InPt(1.2), 3, ACCENT_GOLD)
    
    Set shp = AddTextBox(sld, 0.7, 1.5, 5.8, 5#, _
        "• Between 1946-47, the Nationalists made gains in cities and the north and pushed the Communists out of Yan'an." & vbCrLf & vbCrLf & _
        "• In 1946, Mao reorganized communist forces in a single army People's Liberation Army (PLA)" & vbCrLf & _
        "    – Developed successful guerrilla tactics and took control of Manchuria" & vbCrLf & vbCrLf & _
        "• By mid-1947, the PLA turned to conventional warfare and pushed into Nationalist strongholds in the center and west.")
    FormatText shp.TextFrame.TextRange, 16, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 11: DEVELOPING A COMPLEX THESIS
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(11, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    Set shp = AddTextBox(sld, 0.7, 0.4, 12#, 0.7, "Developing a Complex Thesis")
    FormatText shp.TextFrame.TextRange, 28, TEXT_PRI, True, "Georgia"
    Call AddBar(sld, InPt(0.7), InPt(1.1), InPt(1.2), 3, ACCENT_GOLD)
    
    Set shp = AddTextBox(sld, 0.7, 1.5, 12#, 5.5, _
        "• A thesis statement is a specific roadmap to a historical argument, not a short-answer response" & vbCrLf & _
        "    – An evaluation or overall answer to the question" & vbCrLf & _
        "    – A line of reasoning that shows the moves you will make in your essay" & vbCrLf & _
        "       > Each point should be a category of evidence, not a single piece of evidence (think broad buckets that contain pieces of evidence INSIDE)" & vbCrLf & vbCrLf & _
        "• Thesis statements are created by first analyzing and organizing evidence into buckets" & vbCrLf & _
        "    – Group your evidence into groups, then name the category and develop a claim about that group" & vbCrLf & _
        "    – Once you develop your specific groups, you can see if you have complexity" & vbCrLf & _
        "       > Multiple groups about a PIECES category, positive or negative categories, continuities or changes, similarities or differences, or some other division that fits your question")
    FormatText shp.TextFrame.TextRange, 16, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 12: ACTIVITY
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(12, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    Call AddCard(sld, 1.5, 1#, 10.3, 5.5, RGB(40, 40, 48), RGB(58, 58, 66))
    
    Set shp = AddTextBox(sld, 2#, 1.3, 9.3, 1.2, _
        "What factors contributed to the success of the CCP and downfall of the KMT in Mainland China?")
    FormatText shp.TextFrame.TextRange, 22, TEXT_PRI, True, "Georgia"
    Call AddBar(sld, InPt(2#), InPt(2.5), InPt(9.3), 3, ACCENT_RED)
    
    Set shp = AddTextBox(sld, 2#, 2.8, 9.3, 3.5, _
        "• Work with your table to organize the evidence into three or four groups." & vbCrLf & vbCrLf & _
        "• Once you organize the evidence, paraphrase the evidence on the handout and create a claim for each group. Be sure your claim includes a name for that group." & vbCrLf & _
        "    – The [GMD/CCP] [won/lost] because…" & vbCrLf & _
        "    – As you write your claims, think about next-level organization — are your claims political (including military), economic, social?" & vbCrLf & vbCrLf & _
        "• When you're finished, I will give you a specific prompt that you can respond to with a thesis statement.")
    FormatText shp.TextFrame.TextRange, 16, TEXT_SEC, False, "Calibri"
    
    ' ═══════════════════════════════════════════════════
    ' SLIDE 13: WORK TIME
    ' ═══════════════════════════════════════════════════
    Set sld = prs.Slides.Add(13, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = BG_SLIDE
    Call AddBar(sld, 0, 0, sw, 4, ACCENT_RED)
    
    ' Left panel
    Call AddCard(sld, 0.5, 1.2, 3#, 5#, RGB(44, 44, 52), RGB(58, 58, 66))
    Set shp = AddTextBox(sld, 0.7, 3#, 2.6, 1.5, "Work" & vbCrLf & "Time")
    FormatText shp.TextFrame.TextRange, 34, TEXT_PRI, True, "Georgia"
    shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
    
    ' Task cards
    Dim wtColors(0 To 4) As Long
    wtColors(0) = WT_ORANGE: wtColors(1) = WT_GRAY: wtColors(2) = WT_GOLD
    wtColors(3) = WT_BLUE: wtColors(4) = WT_GREEN
    
    Dim wtTexts(0 To 4) As String
    wtTexts(0) = "You have the rest of class to work on your historical fiction project."
    wtTexts(1) = "Use the Rough Draft Templates for planning and to get teacher feedback."
    wtTexts(2) = "Take a look at some sample scrapbooks or storybooks if you need some ideas."
    wtTexts(3) = "Make sure you have your source for Entry 5 at the start of next class for the reassessment."
    wtTexts(4) = "If you do not submit a draft, I will assign you to the Second Chance room for the following day. Plan ahead!"
    
    Dim i As Integer
    Dim cardY As Single
    For i = 0 To 4
        cardY = InPt(1.2) + i * (InPt(0.85) + InPt(0.15))
        Set shp = sld.Shapes.AddShape(msoShapeRoundedRectangle, InPt(4#), cardY, InPt(8.8), InPt(0.85))
        shp.Fill.Solid
        shp.Fill.ForeColor.RGB = wtColors(i)
        shp.Line.Visible = msoFalse
        
        Dim tc As Long
        If i = 2 Then tc = BLACK Else tc = WHITE
        
        Set shp = AddTextBox(sld, 4.3, 0, 8.2, 0.7, wtTexts(i))
        shp.Top = cardY + InPt(0.1)
        FormatText shp.TextFrame.TextRange, 14, tc, False, "Calibri"
    Next i
    
    MsgBox "Presentation built! " & prs.Slides.Count & " slides created.", vbInformation
    
End Sub

' ─── Helper Functions ───────────────────────────────
Private Function InPt(inches As Double) As Single
    InPt = CSng(inches * 72)
End Function

Private Function AddTextBox(sld As Slide, l As Double, t As Double, w As Double, h As Double, txt As String) As Shape
    Set AddTextBox = sld.Shapes.AddTextbox(msoTextOrientationHorizontal, InPt(l), InPt(t), InPt(w), InPt(h))
    AddTextBox.TextFrame.TextRange.Text = txt
    AddTextBox.TextFrame.WordWrap = msoTrue
    AddTextBox.Line.Visible = msoFalse
    AddTextBox.Fill.Visible = msoFalse
End Function

Private Sub FormatText(tr As TextRange, sz As Integer, clr As Long, bld As Boolean, fnt As String)
    tr.Font.Size = sz
    tr.Font.Color.RGB = clr
    tr.Font.Bold = IIf(bld, msoTrue, msoFalse)
    tr.Font.Name = fnt
End Sub

Private Sub AddBar(sld As Slide, l As Single, t As Single, w As Single, h As Single, clr As Long)
    Dim shp As Shape
    Set shp = sld.Shapes.AddShape(msoShapeRectangle, l, t, w, h)
    shp.Fill.Solid
    shp.Fill.ForeColor.RGB = clr
    shp.Line.Visible = msoFalse
End Sub

Private Sub AddCard(sld As Slide, l As Double, t As Double, w As Double, h As Double, _
    bgClr As Long, Optional borderClr As Long = -1)
    Dim shp As Shape
    Set shp = sld.Shapes.AddShape(msoShapeRoundedRectangle, InPt(l), InPt(t), InPt(w), InPt(h))
    shp.Fill.Solid
    shp.Fill.ForeColor.RGB = bgClr
    If borderClr <> -1 Then
        shp.Line.Visible = msoTrue
        shp.Line.ForeColor.RGB = borderClr
        shp.Line.Weight = 1
    Else
        shp.Line.Visible = msoFalse
    End If
End Sub

Private Sub BuildConnectionsSlide(prs As Presentation, slideNum As Integer, _
    bgClr As Long, barClr As Long, titleClr As Long, defBg As Long, defFg As Long, _
    r1 As String, r2 As String, r3 As String, r4 As String, _
    c1 As Long, c2 As Long, c3 As Long, c4 As Long, _
    t1 As Long, t2 As Long, t3 As Long, t4 As Long)
    
    Dim sld As Slide
    Set sld = prs.Slides.Add(slideNum, ppLayoutBlank)
    sld.FollowMasterBackground = False
    sld.Background.Fill.Solid
    sld.Background.Fill.ForeColor.RGB = bgClr
    
    Dim sw As Single: sw = prs.PageSetup.SlideWidth
    Call AddBar(sld, 0, 0, sw, 4, barClr)
    
    ' Title
    Dim shp As Shape
    Set shp = AddTextBox(sld, 0.5, 2.2, 2.5, 1.5, "Warm-up:" & vbCrLf & "Connections!")
    FormatText shp.TextFrame.TextRange, 32, titleClr, True, "Georgia"
    
    ' Grid
    Dim rows(0 To 3) As String
    rows(0) = r1: rows(1) = r2: rows(2) = r3: rows(3) = r4
    Dim colors(0 To 3) As Long
    colors(0) = c1: colors(1) = c2: colors(2) = c3: colors(3) = c4
    Dim tColors(0 To 3) As Long
    tColors(0) = t1: tColors(1) = t2: tColors(2) = t3: tColors(3) = t4
    
    Dim r As Integer, c As Integer
    Dim cells() As String
    Dim cellW As Single: cellW = InPt(1.85)
    Dim cellH As Single: cellH = InPt(1#)
    Dim gap As Single: gap = InPt(0.12)
    Dim gridL As Single: gridL = InPt(3.3)
    Dim gridT As Single: gridT = InPt(1.8)
    
    For r = 0 To 3
        cells = Split(rows(r), "|")
        For c = 0 To 3
            Dim x As Single: x = gridL + c * (cellW + gap)
            Dim y As Single: y = gridT + r * (cellH + gap)
            Set shp = sld.Shapes.AddShape(msoShapeRoundedRectangle, x, y, cellW, cellH)
            shp.Fill.Solid
            shp.Fill.ForeColor.RGB = colors(r)
            shp.Line.Visible = msoFalse
            shp.TextFrame.TextRange.Text = cells(c)
            FormatText shp.TextFrame.TextRange, 13, tColors(r), True, "Calibri"
            shp.TextFrame.TextRange.ParagraphFormat.Alignment = ppAlignCenter
            shp.TextFrame.VerticalAnchor = msoAnchorMiddle
            shp.TextFrame.WordWrap = msoTrue
        Next c
    Next r
    
End Sub

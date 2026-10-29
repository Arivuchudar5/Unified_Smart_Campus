require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Timetable = require("../models/Timetable");
const Mark = require("../models/Mark");
const LeaveRequest = require("../models/LeaveRequest");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const Note = require("../models/Note");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_campus_db";
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log("Clearing existing campus database collections...");
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Faculty.deleteMany(),
      Course.deleteMany(),
      Student.deleteMany(),
      Attendance.deleteMany(),
      Assignment.deleteMany(),
      Submission.deleteMany(),
      Timetable.deleteMany(),
      Mark.deleteMany(),
      LeaveRequest.deleteMany(),
      Announcement.deleteMany(),
      Notification.deleteMany(),
      Note.deleteMany()
    ]);

    console.log("1. Creating Admin Account...");
    const adminUser = await User.create({
      name: "Dr. Robert Vance (Campus Director)",
      email: "admin@campus.edu",
      password: "Admin@123",
      role: "admin",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    });

    console.log("2. Creating Departments...");
    const cseDept = await Department.create({
      name: "Computer Science and Engineering",
      code: "CSE",
      description: "Department of Computer Science, AI, and Software Engineering",
      status: "active"
    });

    const itDept = await Department.create({
      name: "Information Technology",
      code: "IT",
      description: "Department of Information Technology, Cloud Systems & Security",
      status: "active"
    });

    console.log("3. Creating Faculty Accounts...");
    const faculty1User = await User.create({
      name: "Dr. Alan Turing",
      email: "faculty1@campus.edu",
      password: "Faculty@123",
      role: "faculty",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    });

    const faculty1 = await Faculty.create({
      user: faculty1User._id,
      name: "Dr. Alan Turing",
      facultyId: "FAC-CSE-01",
      email: "faculty1@campus.edu",
      phone: "+1 555-0192",
      department: cseDept._id,
      designation: "Professor & HOD",
      profilePhoto: faculty1User.avatar,
      status: "active"
    });

    cseDept.hod = faculty1._id;
    cseDept.hodName = faculty1.name;
    await cseDept.save();

    const faculty2User = await User.create({
      name: "Dr. Ada Lovelace",
      email: "faculty2@campus.edu",
      password: "Faculty@123",
      role: "faculty",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    });

    const faculty2 = await Faculty.create({
      user: faculty2User._id,
      name: "Dr. Ada Lovelace",
      facultyId: "FAC-IT-02",
      email: "faculty2@campus.edu",
      phone: "+1 555-0193",
      department: itDept._id,
      designation: "Associate Professor & HOD",
      profilePhoto: faculty2User.avatar,
      status: "active"
    });

    itDept.hod = faculty2._id;
    itDept.hodName = faculty2.name;
    await itDept.save();

    console.log("4. Creating Courses...");
    const courseDsa = await Course.create({
      name: "Data Structures & Algorithms",
      code: "CS201",
      department: cseDept._id,
      semester: 4,
      credits: 4,
      faculty: faculty1._id,
      description: "Advanced data structures, trees, graphs, and algorithmic complexity"
    });

    const courseDbms = await Course.create({
      name: "Database Management Systems",
      code: "CS202",
      department: cseDept._id,
      semester: 4,
      credits: 4,
      faculty: faculty1._id,
      description: "Relational modeling, SQL, normalization, NoSQL, and transactions"
    });

    const courseWeb = await Course.create({
      name: "Full Stack Web Development",
      code: "CS203",
      department: cseDept._id,
      semester: 4,
      credits: 3,
      faculty: faculty1._id,
      description: "React.js, Node.js, Express, MongoDB and modern REST API architectures"
    });

    const courseCn = await Course.create({
      name: "Computer Networks & Protocols",
      code: "IT201",
      department: itDept._id,
      semester: 4,
      credits: 4,
      faculty: faculty2._id,
      description: "TCP/IP suite, network routing, switching, and socket programming"
    });

    const courseOs = await Course.create({
      name: "Operating Systems & Kernel Design",
      code: "IT202",
      department: itDept._id,
      semester: 4,
      credits: 4,
      faculty: faculty2._id,
      description: "Process synchronization, memory management, and file systems"
    });

    const courseAi = await Course.create({
      name: "Artificial Intelligence & ML",
      code: "CS204",
      department: cseDept._id,
      semester: 4,
      credits: 3,
      faculty: faculty2._id,
      description: "Search algorithms, probabilistic reasoning, and machine learning models"
    });

    // Update faculty assigned subjects
    faculty1.assignedSubjects = [courseDsa._id, courseDbms._id, courseWeb._id];
    await faculty1.save();
    faculty2.assignedSubjects = [courseCn._id, courseOs._id, courseAi._id];
    await faculty2.save();

    console.log("5. Creating 10 Students...");
    const studentNames = [
      "Alex Johnson", "Sophia Martinez", "David Smith", "Emma Watson", "Michael Brown",
      "Olivia Taylor", "James Wilson", "Isabella Anderson", "William Thomas", "Mia Garcia"
    ];

    const studentRecords = [];
    for (let i = 0; i < studentNames.length; i++) {
      const idx = i + 1;
      const email = `student${idx}@campus.edu`;
      const reg = `2026CS${100 + idx}`;
      const name = studentNames[i];
      const dept = idx <= 6 ? cseDept._id : itDept._id;

      const studentUser = await User.create({
        name,
        email,
        password: "Student@123",
        role: "student",
        status: "active",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(" ", "")}`
      });

      const student = await Student.create({
        user: studentUser._id,
        name,
        registerNumber: reg,
        email,
        phone: `+1 555-02${idx < 10 ? "0" + idx : idx}`,
        department: dept,
        course: courseDsa._id,
        year: 2,
        semester: 4,
        address: `${100 + idx} University Avenue, Campus City`,
        profilePhoto: studentUser.avatar,
        status: "active"
      });

      studentRecords.push(student);
    }

    console.log("6. Creating Timetable Entries...");
    const timetableEntries = [
      // Monday
      { department: cseDept._id, course: courseDsa._id, semester: 4, subject: "Data Structures & Algorithms (CS201)", faculty: faculty1._id, day: "Monday", startTime: "09:00", endTime: "10:00", room: "LH-101" },
      { department: cseDept._id, course: courseDbms._id, semester: 4, subject: "Database Management Systems (CS202)", faculty: faculty1._id, day: "Monday", startTime: "10:15", endTime: "11:15", room: "LH-101" },
      { department: cseDept._id, course: courseWeb._id, semester: 4, subject: "Full Stack Web Development (CS203)", faculty: faculty1._id, day: "Monday", startTime: "11:30", endTime: "12:30", room: "Lab-3" },
      { department: itDept._id, course: courseCn._id, semester: 4, subject: "Computer Networks (IT201)", faculty: faculty2._id, day: "Monday", startTime: "13:30", endTime: "14:30", room: "LH-201" },
      { department: itDept._id, course: courseOs._id, semester: 4, subject: "Operating Systems (IT202)", faculty: faculty2._id, day: "Monday", startTime: "14:45", endTime: "15:45", room: "LH-201" },

      // Tuesday
      { department: cseDept._id, course: courseDbms._id, semester: 4, subject: "DBMS Lab (CS202)", faculty: faculty1._id, day: "Tuesday", startTime: "09:00", endTime: "11:00", room: "Lab-1" },
      { department: cseDept._id, course: courseDsa._id, semester: 4, subject: "Data Structures & Algorithms (CS201)", faculty: faculty1._id, day: "Tuesday", startTime: "11:15", endTime: "12:15", room: "LH-101" },
      { department: itDept._id, course: courseAi._id, semester: 4, subject: "AI & Machine Learning (CS204)", faculty: faculty2._id, day: "Tuesday", startTime: "13:30", endTime: "14:30", room: "LH-102" },

      // Wednesday
      { department: cseDept._id, course: courseWeb._id, semester: 4, subject: "Full Stack Web Development (CS203)", faculty: faculty1._id, day: "Wednesday", startTime: "09:00", endTime: "10:00", room: "LH-101" },
      { department: cseDept._id, course: courseDsa._id, semester: 4, subject: "DSA Problem Solving (CS201)", faculty: faculty1._id, day: "Wednesday", startTime: "10:15", endTime: "11:15", room: "Lab-2" },
      { department: itDept._id, course: courseCn._id, semester: 4, subject: "Networks Lab (IT201)", faculty: faculty2._id, day: "Wednesday", startTime: "13:30", endTime: "15:30", room: "Lab-4" },

      // Thursday
      { department: cseDept._id, course: courseDbms._id, semester: 4, subject: "Database Management Systems (CS202)", faculty: faculty1._id, day: "Thursday", startTime: "09:00", endTime: "10:00", room: "LH-101" },
      { department: itDept._id, course: courseOs._id, semester: 4, subject: "Operating Systems (IT202)", faculty: faculty2._id, day: "Thursday", startTime: "10:15", endTime: "11:15", room: "LH-201" },
      { department: itDept._id, course: courseAi._id, semester: 4, subject: "AI & Machine Learning (CS204)", faculty: faculty2._id, day: "Thursday", startTime: "11:30", endTime: "12:30", room: "LH-102" },

      // Friday
      { department: cseDept._id, course: courseWeb._id, semester: 4, subject: "Web Development Lab (CS203)", faculty: faculty1._id, day: "Friday", startTime: "09:00", endTime: "11:00", room: "Lab-3" },
      { department: cseDept._id, course: courseDsa._id, semester: 4, subject: "Data Structures & Algorithms (CS201)", faculty: faculty1._id, day: "Friday", startTime: "11:15", endTime: "12:15", room: "LH-101" },
      { department: itDept._id, course: courseOs._id, semester: 4, subject: "OS Lab (IT202)", faculty: faculty2._id, day: "Friday", startTime: "13:30", endTime: "15:30", room: "Lab-2" }
    ];

    await Timetable.insertMany(timetableEntries);

    console.log("7. Creating Attendance Records for Past Days...");
    const sampleDates = ["2026-08-20", "2026-08-21", "2026-08-22", "2026-08-25", "2026-08-26", "2026-08-27"];
    const allCourses = [courseDsa, courseDbms, courseWeb, courseCn, courseOs, courseAi];

    const attendanceRecords = [];
    sampleDates.forEach((date, dateIdx) => {
      studentRecords.forEach((student, studentIdx) => {
        allCourses.forEach((course) => {
          // Semi-random deterministic attendance (~90% present)
          const isPresent = (studentIdx + dateIdx + course.credits) % 8 !== 0;
          attendanceRecords.push({
            student: student._id,
            faculty: course.faculty,
            department: student.department,
            course: course._id,
            semester: 4,
            date: date,
            status: isPresent ? "Present" : "Absent",
            remarks: isPresent ? "Attended regular lecture" : "Absent"
          });
        });
      });
    });
    await Attendance.insertMany(attendanceRecords);

    console.log("8. Creating Assignments...");
    const assign1 = await Assignment.create({
      title: "Binary Search Trees & AVL Tree Balancing Implementation",
      description: "Implement a fully functional AVL tree with insertion, deletion, and rotation balance factor checks in C++ or Java. Submit complete source code and test outputs.",
      department: cseDept._id,
      course: courseDsa._id,
      semester: 4,
      faculty: faculty1._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      maxMarks: 100,
      attachmentUrl: "/uploads/sample-assignment-spec.pdf",
      attachmentName: "Assignment1-AVL-Trees-Spec.pdf"
    });

    const assign2 = await Assignment.create({
      title: "Normalization & SQL Complex Joins Schema Design",
      description: "Design a 3NF normalized database schema for a Healthcare Hospital Management System. Write queries for multi-table inner/outer joins, aggregate views, and triggers.",
      department: cseDept._id,
      course: courseDbms._id,
      semester: 4,
      faculty: faculty1._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
      maxMarks: 50,
      attachmentUrl: "/uploads/sample-dbms-assignment.pdf",
      attachmentName: "DBMS-CaseStudy-Hospital.pdf"
    });

    const assign3 = await Assignment.create({
      title: "TCP vs UDP Socket Communication Client-Server App",
      description: "Build a socket programming application in Node.js or Python demonstrating reliable packet transmission and latency comparison.",
      department: itDept._id,
      course: courseCn._id,
      semester: 4,
      faculty: faculty2._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxMarks: 100
    });

    console.log("9. Creating Sample Submissions...");
    // Student 1 submits assign1 (Evaluated)
    const sub1 = await Submission.create({
      assignment: assign1._id,
      student: studentRecords[0]._id,
      submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fileUrl: "/uploads/sample-avl-tree-solution.pdf",
      fileName: "AlexJohnson_CS201_AVL_Trees.pdf",
      comments: "Implemented all rotations and edge cases tested with 10,000 random nodes.",
      marksObtained: 95,
      feedback: "Excellent implementation! Code formatting and rotation logic are flawless.",
      status: "Evaluated",
      evaluatedAt: new Date()
    });

    // Student 2 submits assign1 (Submitted, awaiting evaluation)
    const sub2 = await Submission.create({
      assignment: assign1._id,
      student: studentRecords[1]._id,
      submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      fileUrl: "/uploads/sample-avl-tree-solution.pdf",
      fileName: "SophiaMartinez_CS201_AVL.pdf",
      comments: "Included visualization graph generation in Python.",
      status: "Submitted"
    });

    // Student 1 submits assign2 (Submitted)
    const sub3 = await Submission.create({
      assignment: assign2._id,
      student: studentRecords[0]._id,
      submissionDate: new Date(),
      fileUrl: "/uploads/sample-dbms-solution.pdf",
      fileName: "AlexJohnson_DBMS_Schema.pdf",
      comments: "Normalized schema up to BCNF with DDL scripts attached.",
      status: "Submitted"
    });

    console.log("10. Creating Marks...");
    const sampleMarks = [
      {
        student: studentRecords[0]._id,
        faculty: faculty1._id,
        department: cseDept._id,
        course: courseDsa._id,
        semester: 4,
        internalMarks: 28,
        assignmentMarks: 19,
        examMarks: 45,
        maxMarks: 100
      },
      {
        student: studentRecords[0]._id,
        faculty: faculty1._id,
        department: cseDept._id,
        course: courseDbms._id,
        semester: 4,
        internalMarks: 26,
        assignmentMarks: 18,
        examMarks: 44,
        maxMarks: 100
      },
      {
        student: studentRecords[0]._id,
        faculty: faculty1._id,
        department: cseDept._id,
        course: courseWeb._id,
        semester: 4,
        internalMarks: 29,
        assignmentMarks: 20,
        examMarks: 48,
        maxMarks: 100
      },
      {
        student: studentRecords[1]._id,
        faculty: faculty1._id,
        department: cseDept._id,
        course: courseDsa._id,
        semester: 4,
        internalMarks: 25,
        assignmentMarks: 17,
        examMarks: 42,
        maxMarks: 100
      },
      {
        student: studentRecords[2]._id,
        faculty: faculty1._id,
        department: cseDept._id,
        course: courseDsa._id,
        semester: 4,
        internalMarks: 22,
        assignmentMarks: 15,
        examMarks: 38,
        maxMarks: 100
      }
    ];

    for (const m of sampleMarks) {
      await Mark.create(m);
    }

    console.log("11. Creating Leave Requests...");
    const leave1 = await LeaveRequest.create({
      student: studentRecords[0]._id,
      department: cseDept._id,
      leaveType: "Medical Leave",
      fromDate: "2026-09-01",
      toDate: "2026-09-03",
      reason: "Recovery from acute seasonal viral fever. Doctor's medical certificate attached.",
      status: "Approved",
      reviewedBy: faculty1User._id,
      reviewerName: faculty1.name,
      reviewRemarks: "Approved. Please catch up with the missed lab work upon return."
    });

    const leave2 = await LeaveRequest.create({
      student: studentRecords[1]._id,
      department: cseDept._id,
      leaveType: "Academic Leave",
      fromDate: "2026-09-05",
      toDate: "2026-09-07",
      reason: "Attending National Inter-College Hackathon at National Institute of Technology.",
      status: "Pending"
    });

    const leave3 = await LeaveRequest.create({
      student: studentRecords[2]._id,
      department: cseDept._id,
      leaveType: "Personal Leave",
      fromDate: "2026-08-28",
      toDate: "2026-08-29",
      reason: "Attending family wedding ceremony.",
      status: "Rejected",
      reviewedBy: adminUser._id,
      reviewerName: adminUser.name,
      reviewRemarks: "Rejected due to overlap with scheduled Internal Assessment exams."
    });

    console.log("12. Creating Announcements...");
    await Announcement.create({
      title: "Mid-Term Examination Schedule Released (Fall 2026)",
      description: "The Mid-Term Semester Examinations for all undergraduate and postgraduate engineering courses will commence from September 15, 2026. Hall tickets and seating arrangements will be posted on the portal next week.",
      category: "Exam",
      targetAudience: "All",
      postedBy: adminUser._id,
      authorName: "Office of the Controller of Examinations"
    });

    await Announcement.create({
      title: "Annual Smart India Hackathon 2026 - Campus Round Registrations",
      description: "Registrations are now officially open for the internal college selection round for SIH 2026. Teams of 6 students (with at least 1 female team member) should submit project abstracts before Sept 10.",
      category: "Event",
      targetAudience: "All Students",
      postedBy: adminUser._id,
      authorName: "Campus Innovation Council"
    });

    await Announcement.create({
      title: "CSE Department Guest Lecture: High-Performance GPU Computing",
      description: "Guest lecture by Senior Architect from NVIDIA on CUDA parallel programming and tensor cores on Friday, 3:00 PM at Auditorium 1.",
      category: "Academic",
      targetAudience: "Department",
      department: cseDept._id,
      postedBy: faculty1User._id,
      authorName: "Dr. Alan Turing"
    });

    console.log("13. Creating Notifications...");
    await Notification.create({
      recipient: studentRecords[0].user,
      title: "Assignment Evaluated",
      message: 'Your submission for "Binary Search Trees & AVL Tree Balancing Implementation" has been graded: 95/100.',
      type: "marks",
      link: "/student/assignments",
      isRead: false
    });

    await Notification.create({
      recipient: studentRecords[0].user,
      title: "Leave Request Approved",
      message: "Your medical leave application for 2026-09-01 to 2026-09-03 has been APPROVED.",
      type: "leave",
      link: "/student/leave",
      isRead: false
    });

    await Notification.create({
      recipient: studentRecords[0].user,
      title: "Marks Published",
      message: "Marks updated for Full Stack Web Development: Total 97/100 (Grade: A+).",
      type: "marks",
      link: "/student/marks",
      isRead: true
    });

    console.log("14. Creating Lecture Notes...");
    await Note.create({
      title: "Unit 1: Self-Balancing Trees (AVL & Red-Black Trees)",
      description: "Complete lecture slide deck covering balance factors, rotations, and worst-case search complexity proofs.",
      department: cseDept._id,
      course: courseDsa._id,
      semester: 4,
      faculty: faculty1._id,
      fileUrl: "/uploads/sample-lecture-notes.pdf",
      fileName: "DSA-Unit1-AVL-Trees.pdf",
      fileSize: "2.4 MB"
    });

    await Note.create({
      title: "Unit 2: Relational Algebra & Normalization Forms (1NF to BCNF)",
      description: "Comprehensive notes on functional dependencies, candidate keys, and multi-valued dependencies.",
      department: cseDept._id,
      course: courseDbms._id,
      semester: 4,
      faculty: faculty1._id,
      fileUrl: "/uploads/sample-lecture-notes.pdf",
      fileName: "DBMS-Unit2-Normalization.pdf",
      fileSize: "3.1 MB"
    });

    await Note.create({
      title: "Unit 3: Modern React Hooks & Context API Architecture",
      description: "Deep dive into useState, useEffect, useMemo, custom hooks, and state management patterns.",
      department: cseDept._id,
      course: courseWeb._id,
      semester: 4,
      faculty: faculty1._id,
      fileUrl: "/uploads/sample-lecture-notes.pdf",
      fileName: "React-State-Architecture.pdf",
      fileSize: "1.8 MB"
    });

    console.log("==================================================");
    console.log("SMART CAMPUS DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("Login Credentials:");
    console.log("Admin:   admin@campus.edu    / Admin@123");
    console.log("Faculty: faculty1@campus.edu / Faculty@123 (Dr. Alan Turing - CSE)");
    console.log("Faculty: faculty2@campus.edu / Faculty@123 (Dr. Ada Lovelace - IT)");
    console.log("Student: student1@campus.edu / Student@123 (Alex Johnson, Reg: 2026CS101)");
    console.log("Student: student2@campus.edu / Student@123 (Sophia Martinez, Reg: 2026CS102)");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();

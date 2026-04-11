/**
 * Seed script: Adds high-quality C++ questions across easy/medium/hard difficulty.
 * Safely skips any that already exist. Also purges empty/null questions.
 */
const db = require('./db');

// 1. Remove any empty/null questions
const cleaned = db.prepare(`
  DELETE FROM questions 
  WHERE question_text IS NULL OR trim(question_text) = ''
     OR option_a IS NULL OR trim(option_a) = ''
     OR correct_answer IS NULL OR trim(correct_answer) = ''
`).run();
console.log(`Cleaned ${cleaned.changes} empty/null questions.`);

// 2. High-quality C++ questions: 20 easy, 20 medium, 20 hard
const questions = [
  // ===== EASY =====
  { category:'cpp', difficulty:'easy', question_text:'What is the correct way to declare a variable in C++?', option_a:'int x = 5;', option_b:'variable x = 5;', option_c:'declare x = 5;', option_d:'x := 5;', correct_answer:'A' },
  { category:'cpp', difficulty:'easy', question_text:'Which symbol is used to end a statement in C++?', option_a:':', option_b:'.', option_c:';', option_d:'!', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'What does #include do in C++?', option_a:'Defines a function', option_b:'Includes a header file', option_c:'Creates a class', option_d:'Declares a variable', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'Which of the following is a valid C++ comment?', option_a:'/* comment */', option_b:'** comment **', option_c:'## comment', option_d:'<!-- comment -->', correct_answer:'A' },
  { category:'cpp', difficulty:'easy', question_text:'What is the output of: cout << 5 + 3;', option_a:'5 + 3', option_b:'53', option_c:'8', option_d:'Error', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'Which keyword is used to define a constant in C++?', option_a:'constant', option_b:'final', option_c:'const', option_d:'static', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'What is the size of int on a 32-bit system in C++?', option_a:'1 byte', option_b:'2 bytes', option_c:'4 bytes', option_d:'8 bytes', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'Which header file is required for using cout?', option_a:'<cstdio>', option_b:'<iostream>', option_c:'<string>', option_d:'<cmath>', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'How do you create an integer array of size 5 in C++?', option_a:'array<5> int a;', option_b:'int a[5];', option_c:'int[5] a;', option_d:'create int a(5);', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'What is the entry point of a C++ program?', option_a:'start()', option_b:'begin()', option_c:'main()', option_d:'init()', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'Which operator is used to get the address of a variable?', option_a:'*', option_b:'&', option_c:'@', option_d:'#', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'What is the default return type of main() in C++?', option_a:'void', option_b:'bool', option_c:'int', option_d:'char', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'Which loop is guaranteed to execute at least once?', option_a:'for loop', option_b:'while loop', option_c:'do-while loop', option_d:'range-based for loop', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'What does cin >> x; do in C++?', option_a:'Prints x to screen', option_b:'Reads input into x', option_c:'Declares x', option_d:'Deletes x', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'What keyword is used to define a class in C++?', option_a:'struct', option_b:'type', option_c:'class', option_d:'object', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'What is the correct syntax for a single-line comment in C++?', option_a:'# comment', option_b:'-- comment', option_c:'// comment', option_d:'<!-- comment -->', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'Which of the following is NOT a C++ primitive data type?', option_a:'int', option_b:'float', option_c:'string', option_d:'char', correct_answer:'C' },
  { category:'cpp', difficulty:'easy', question_text:'What does the "new" keyword do in C++?', option_a:'Declares a function', option_b:'Allocates memory on the heap', option_c:'Creates a new file', option_d:'Initializes a loop', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'What is a namespace used for in C++?', option_a:'To declare variables', option_b:'To organize code and avoid name conflicts', option_c:'To allocate memory', option_d:'To create loops', correct_answer:'B' },
  { category:'cpp', difficulty:'easy', question_text:'Which operator checks for equality in C++?', option_a:'=', option_b:'!=', option_c:'==', option_d:'===', correct_answer:'C' },

  // ===== MEDIUM =====
  { category:'cpp', difficulty:'medium', question_text:'Which C++ concept allows the same function name with different parameters?', option_a:'Overriding', option_b:'Overloading', option_c:'Polymorphism', option_d:'Encapsulation', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What is the output of: int x = 5; cout << x++;', option_a:'6', option_b:'5', option_c:'4', option_d:'Error', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'In C++, which access specifier makes members accessible only within the class?', option_a:'public', option_b:'protected', option_c:'private', option_d:'internal', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is a reference variable in C++?', option_a:'A pointer to a pointer', option_b:'An alias for an existing variable', option_c:'A constant pointer', option_d:'A function pointer', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'Which STL container stores unique elements in sorted order?', option_a:'vector', option_b:'list', option_c:'set', option_d:'deque', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is the difference between struct and class in C++?', option_a:'No difference', option_b:'struct members are public by default, class members are private by default', option_c:'struct cannot have functions', option_d:'class cannot have data members', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What does the "this" pointer refer to?', option_a:'The parent class', option_b:'The current object instance', option_c:'A null pointer', option_d:'A static member', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'Which of the following correctly deletes a dynamically-allocated array?', option_a:'delete arr;', option_b:'delete[] arr;', option_c:'free(arr);', option_d:'destroy arr;', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What is a pure virtual function in C++?', option_a:'A function that returns void', option_b:'A function with no body, declared with = 0', option_c:'A static function in a class', option_d:'A function defined outside a class', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What does std::vector::push_back() do?', option_a:'Removes the last element', option_b:'Inserts an element at the beginning', option_c:'Adds an element to the end', option_d:'Sorts the vector', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is a copy constructor?', option_a:'A constructor that takes no arguments', option_b:'A constructor that initializes an object from another object of the same class', option_c:'A constructor that copies functions from the parent class', option_d:'A constructor that allocates dynamic memory', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What does "inline" keyword suggest to the compiler?', option_a:'Expand function code at call site', option_b:'Make function private', option_c:'Make function static', option_d:'Skip function compilation', correct_answer:'A' },
  { category:'cpp', difficulty:'medium', question_text:'Which header is needed for std::sort?', option_a:'<vector>', option_b:'<algorithm>', option_c:'<functional>', option_d:'<iterator>', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'What is the output of: int a=10, b=3; cout << a%b;', option_a:'3', option_b:'0', option_c:'1', option_d:'3.33', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is multiple inheritance in C++?', option_a:'Having multiple objects of a class', option_b:'A class inheriting from more than one base class', option_c:'Multiple functions with the same name', option_d:'Overriding multiple functions', correct_answer:'B' },
  { category:'cpp', difficulty:'medium', question_text:'Which iterator type allows both read and write access?', option_a:'input_iterator', option_b:'output_iterator', option_c:'forward_iterator', option_d:'bidirectional_iterator', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is the purpose of a destructor?', option_a:'To create an object', option_b:'To copy an object', option_c:'To release resources when an object is destroyed', option_d:'To initialize member variables', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'Which C++ cast is used for safe downcasting with runtime check?', option_a:'static_cast', option_b:'reinterpret_cast', option_c:'dynamic_cast', option_d:'const_cast', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What does std::map store?', option_a:'Unique values sorted', option_b:'Duplicate key-value pairs', option_c:'Unique key-value pairs sorted by key', option_d:'Unsorted key-value pairs', correct_answer:'C' },
  { category:'cpp', difficulty:'medium', question_text:'What is the output of: cout << sizeof(char);', option_a:'2', option_b:'4', option_c:'0', option_d:'1', correct_answer:'D' },

  // ===== HARD =====
  { category:'cpp', difficulty:'hard', question_text:'What is a diamond problem in C++ multiple inheritance?', option_a:'Memory fragmentation', option_b:'Ambiguity when a class inherits from two classes that share a common base', option_c:'Stack overflow', option_d:'Infinite recursion in constructors', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What does std::move() do in C++11?', option_a:'Copies an object', option_b:'Deletes an object', option_c:'Transfers ownership by casting to rvalue reference', option_d:'Swaps two objects', correct_answer:'C' },
  { category:'cpp', difficulty:'hard', question_text:'What is CRTP (Curiously Recurring Template Pattern) used for?', option_a:'Reducing compilation errors', option_b:'Simulating virtual functions at compile-time for static polymorphism', option_c:'Implementing multiple inheritance', option_d:'Managing memory automatically', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is the difference between std::shared_ptr and std::unique_ptr?', option_a:'shared_ptr is faster', option_b:'unique_ptr allows multiple owners; shared_ptr allows only one', option_c:'shared_ptr allows multiple owners via reference counting; unique_ptr allows only one owner', option_d:'There is no difference', correct_answer:'C' },
  { category:'cpp', difficulty:'hard', question_text:'What is undefined behavior in C++?', option_a:'A compile-time error', option_b:'Code that the standard places no requirements on the behavior of', option_c:'A runtime exception', option_d:'A warning from the linker', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What does std::forward() do in perfect forwarding?', option_a:'Copies arguments to the next function', option_b:'Preserves the value category (lvalue/rvalue) of arguments', option_c:'Converts arguments to rvalues always', option_d:'Forwards exceptions across threads', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is the time complexity of std::unordered_map lookup on average?', option_a:'O(log n)', option_b:'O(n)', option_c:'O(1)', option_d:'O(n log n)', correct_answer:'C' },
  { category:'cpp', difficulty:'hard', question_text:'What is a memory leak in C++?', option_a:'Reading from an invalid pointer', option_b:'Allocated heap memory that is never freed', option_c:'Stack overflow from deep recursion', option_d:'Writing past the end of an array', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is a variadic template in C++11?', option_a:'A template with only one parameter', option_b:'A template that accepts a variable number of type parameters', option_c:'A template for variable-length arrays', option_d:'A template that generates virtual functions', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'Which C++ concept ensures memory is freed when an object goes out of scope?', option_a:'Garbage collection', option_b:'RAII (Resource Acquisition Is Initialization)', option_c:'Manual memory management', option_d:'Reference counting only', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What does constexpr guarantee in C++11?', option_a:'The variable is thread-safe', option_b:'The expression is evaluated at compile time', option_c:'The function runs faster', option_d:'The variable is const', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is the output of: int x = 0; int& ref = x; ref = 5; cout << x;', option_a:'0', option_b:'5', option_c:'Error', option_d:'Undefined', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'Which smart pointer should be used when you want shared ownership of a resource?', option_a:'weak_ptr', option_b:'unique_ptr', option_c:'shared_ptr', option_d:'auto_ptr', correct_answer:'C' },
  { category:'cpp', difficulty:'hard', question_text:'What happens when you dereference a dangling pointer?', option_a:'Returns null', option_b:'Throws an exception', option_c:'Undefined behavior', option_d:'Returns 0', correct_answer:'C' },
  { category:'cpp', difficulty:'hard', question_text:'What is a lambda expression in C++11?', option_a:'An anonymous inline function', option_b:'A pointer to a member function', option_c:'A template specialization', option_d:'A virtual function override', correct_answer:'A' },
  { category:'cpp', difficulty:'hard', question_text:'What does the volatile keyword prevent?', option_a:'Compiler from caching the variable value', option_b:'Multiple threads accessing the variable', option_c:'The variable from being modified', option_d:'The variable from being stored on heap', correct_answer:'A' },
  { category:'cpp', difficulty:'hard', question_text:'What is type deduction in C++11 auto keyword?', option_a:'Forces explicit type declaration', option_b:'Lets the compiler determine the type from the initializer', option_c:'Creates a dynamic type variable', option_d:'Prevents implicit type conversion', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is the difference between new/delete and malloc/free in C++?', option_a:'No difference', option_b:'new/delete call constructors/destructors; malloc/free do not', option_c:'malloc/free are type-safe; new/delete are not', option_d:'new/delete are C-style; malloc/free are C++-style', correct_answer:'B' },
  { category:'cpp', difficulty:'hard', question_text:'What is template specialization in C++?', option_a:'Providing a specific implementation for a particular template argument', option_b:'Creating a virtual template function', option_c:'Inheriting from a template class', option_d:'Making a template class abstract', correct_answer:'A' },
  { category:'cpp', difficulty:'hard', question_text:'What guarantees does std::mutex provide?', option_a:'Prevents deadlocks automatically', option_b:'Ensures only one thread can hold the lock at a time', option_c:'Makes all operations atomic', option_d:'Provides priority-based thread scheduling', correct_answer:'B' },
];

// Insert with ignore on conflict (won't duplicate if same text exists)
const insert = db.prepare(`
  INSERT INTO questions (category, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer)
  VALUES (@category, @difficulty, @question_text, @option_a, @option_b, @option_c, @option_d, @correct_answer)
`);

const insertAll = db.transaction((qs) => {
  let added = 0;
  for (const q of qs) {
    // Check duplicate by question text
    const existing = db.prepare('SELECT id FROM questions WHERE question_text = ? AND category = ?')
      .get(q.question_text, q.category);
    if (!existing) {
      insert.run(q);
      added++;
    }
  }
  return added;
});

const added = insertAll(questions);
const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE category = 'cpp'").get();
console.log(`Added ${added} new C++ questions. Total C++ questions: ${total.c}`);
console.log('Breakdown by difficulty:');
['easy','medium','hard'].forEach(d => {
  const count = db.prepare("SELECT COUNT(*) as c FROM questions WHERE category = 'cpp' AND difficulty = ?").get(d);
  console.log(`  ${d}: ${count.c}`);
});

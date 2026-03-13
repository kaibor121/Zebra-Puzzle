import { Puzzle, Constraint } from './puzzles';

export type Assignment = Record<string, number>; // variable -> house index
export type Domains = Record<string, Set<number>>; // variable -> set of possible house indices

export type Step = {
  type: 'ASSIGN' | 'BACKTRACK' | 'FORWARD_CHECK' | 'DOMAIN_REDUCE' | 'SUCCESS' | 'FAIL';
  variable?: string;
  value?: number;
  domains?: Record<string, number[]>; // Snapshot of domains for visualization
  message: string;
};

export class CSPSolver {
  puzzle: Puzzle;
  variables: string[];
  categories: Record<string, string[]>; // category name -> list of variables
  varToCategory: Record<string, string>; // variable -> category name
  constraints: Constraint[];
  steps: Step[];
  houses: number;

  constructor(puzzle: Puzzle) {
    this.puzzle = puzzle;
    this.houses = puzzle.houses;
    this.variables = [];
    this.categories = {};
    this.varToCategory = {};
    
    for (const cat of puzzle.categories) {
      this.categories[cat.name] = cat.options;
      for (const opt of cat.options) {
        this.variables.push(opt);
        this.varToCategory[opt] = cat.name;
      }
    }
    
    this.constraints = puzzle.constraints;
    this.steps = [];
  }

  // Initialize domains for all variables
  initDomains(): Domains {
    const domains: Domains = {};
    const allHouses = new Set(Array.from({ length: this.houses }, (_, i) => i));
    for (const v of this.variables) {
      domains[v] = new Set(allHouses);
    }
    return domains;
  }

  // Check if an assignment violates any constraints
  isConsistent(variable: string, value: number, assignment: Assignment): boolean {
    // 1. AllDifferent constraint within the same category
    const category = this.varToCategory[variable];
    for (const otherVar of this.categories[category]) {
      if (otherVar !== variable && assignment[otherVar] === value) {
        return false;
      }
    }

    // 2. Check explicit constraints
    for (const c of this.constraints) {
      if (c.var1 === variable || c.var2 === variable) {
        const val1 = c.var1 === variable ? value : assignment[c.var1];
        const val2 = c.var2 === variable ? value : (c.var2 ? assignment[c.var2] : undefined);

        if (val1 !== undefined) {
          if (c.type === 'POSITION' && val1 !== c.value) return false;
          if (c.type === 'MIDDLE' && val1 !== Math.floor(this.houses / 2)) return false;
        }

        if (val1 !== undefined && val2 !== undefined) {
          if (c.type === 'EQUAL' && val1 !== val2) return false;
          if (c.type === 'NEXT_TO' && Math.abs(val1 - val2) !== 1) return false;
          if (c.type === 'RIGHT_OF' && val1 !== val2 + 1) return false;
        }
      }
    }

    return true;
  }

  // Forward Checking: Reduce domains of unassigned variables based on current assignment
  forwardCheck(variable: string, value: number, assignment: Assignment, domains: Domains): Domains | null {
    const newDomains: Domains = {};
    for (const v of this.variables) {
      newDomains[v] = new Set(domains[v]);
    }

    // 1. Remove value from other variables in the same category
    const category = this.varToCategory[variable];
    for (const otherVar of this.categories[category]) {
      if (otherVar !== variable && !(otherVar in assignment)) {
        newDomains[otherVar].delete(value);
        if (newDomains[otherVar].size === 0) return null; // Domain wiped out
      }
    }

    // 2. Apply explicit constraints to reduce domains
    for (const c of this.constraints) {
      const isVar1 = c.var1 === variable;
      const isVar2 = c.var2 === variable;
      
      if (!isVar1 && !isVar2) continue;

      const otherVar = isVar1 ? c.var2 : c.var1;
      if (!otherVar || (otherVar in assignment)) continue;

      const currentDomain = newDomains[otherVar];
      const newDomain = new Set<number>();

      for (const possibleVal of currentDomain) {
        const val1 = isVar1 ? value : possibleVal;
        const val2 = isVar2 ? value : possibleVal;

        let isValid = true;
        if (c.type === 'EQUAL' && val1 !== val2) isValid = false;
        if (c.type === 'NEXT_TO' && Math.abs(val1 - val2) !== 1) isValid = false;
        if (c.type === 'RIGHT_OF' && val1 !== val2 + 1) isValid = false;

        if (isValid) newDomain.add(possibleVal);
      }

      newDomains[otherVar] = newDomain;
      if (newDomain.size === 0) return null; // Domain wiped out
    }

    return newDomains;
  }

  // Heuristic: Minimum Remaining Values (MRV)
  // Select the unassigned variable with the smallest domain
  selectUnassignedVariable(assignment: Assignment, domains: Domains): string {
    const unassigned = this.variables.filter(v => !(v in assignment));
    
    // Calculate degree (number of constraints involving the variable)
    const getDegree = (v: string) => {
      return this.constraints.filter(c => 
        (c.var1 === v && c.var2 && !(c.var2 in assignment)) || 
        (c.var2 === v && !(c.var1 in assignment))
      ).length;
    };

    return unassigned.reduce((best, current) => {
      const bestSize = domains[best].size;
      const currentSize = domains[current].size;
      
      if (currentSize < bestSize) return current;
      if (currentSize > bestSize) return best;
      
      // Tie-breaker: Degree Heuristic (choose variable involved in most constraints)
      return getDegree(current) > getDegree(best) ? current : best;
    });
  }

  // Heuristic: Least Constraining Value (LCV)
  // Order values by how many options they leave for other variables
  orderDomainValues(variable: string, assignment: Assignment, domains: Domains): number[] {
    const values = Array.from(domains[variable]);
    
    return values.sort((valA, valB) => {
      // Count how many values would be removed from other domains if we choose valA
      const countRemoved = (val: number) => {
        let removed = 0;
        const testDomains = this.forwardCheck(variable, val, assignment, domains);
        if (!testDomains) return Infinity; // This value leads to immediate failure
        
        for (const v of this.variables) {
          if (!(v in assignment) && v !== variable) {
            removed += (domains[v].size - testDomains[v].size);
          }
        }
        return removed;
      };

      return countRemoved(valA) - countRemoved(valB);
    });
  }

  snapshotDomains(domains: Domains): Record<string, number[]> {
    const snap: Record<string, number[]> = {};
    for (const v in domains) {
      snap[v] = Array.from(domains[v]);
    }
    return snap;
  }

  solve(): Step[] {
    this.steps = [];
    const assignment: Assignment = {};
    let domains = this.initDomains();

    // Initial domain reduction based on unary constraints (POSITION, MIDDLE)
    for (const c of this.constraints) {
      if (c.type === 'POSITION' && c.value !== undefined) {
        domains[c.var1] = new Set([c.value]);
      } else if (c.type === 'MIDDLE') {
        domains[c.var1] = new Set([Math.floor(this.houses / 2)]);
      }
    }

    this.steps.push({
      type: 'DOMAIN_REDUCE',
      message: 'Initial domain reduction based on unary constraints.',
      domains: this.snapshotDomains(domains)
    });

    const backtrack = (assignment: Assignment, domains: Domains): boolean => {
      if (Object.keys(assignment).length === this.variables.length) {
        this.steps.push({ type: 'SUCCESS', message: 'All variables assigned successfully!', domains: this.snapshotDomains(domains) });
        return true;
      }

      const variable = this.selectUnassignedVariable(assignment, domains);
      const values = this.orderDomainValues(variable, assignment, domains);

      for (const value of values) {
        if (this.isConsistent(variable, value, assignment)) {
          assignment[variable] = value;
          this.steps.push({
            type: 'ASSIGN',
            variable,
            value,
            message: `Assigning ${variable} to House ${value + 1} (MRV & LCV)`,
            domains: this.snapshotDomains(domains)
          });

          const newDomains = this.forwardCheck(variable, value, assignment, domains);
          
          if (newDomains) {
            this.steps.push({
              type: 'FORWARD_CHECK',
              variable,
              value,
              message: `Forward checking successful after assigning ${variable}.`,
              domains: this.snapshotDomains(newDomains)
            });

            const result = backtrack(assignment, newDomains);
            if (result) return true;
          } else {
            this.steps.push({
              type: 'FAIL',
              variable,
              value,
              message: `Forward checking failed for ${variable} = ${value + 1}. Domain wiped out.`,
              domains: this.snapshotDomains(domains)
            });
          }

          delete assignment[variable];
          this.steps.push({
            type: 'BACKTRACK',
            variable,
            value,
            message: `Backtracking from ${variable} = ${value + 1}`,
            domains: this.snapshotDomains(domains)
          });
        }
      }

      return false;
    };

    backtrack(assignment, domains);
    return this.steps;
  }
}

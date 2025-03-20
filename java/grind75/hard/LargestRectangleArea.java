package hard;

import java.util.Stack;

public class LargestRectangleArea {

    /**
     *
     *
     * 34792 height
     * -----
     * 12345 index
     *
     * @param heights
     * @return
     */
    public int largestRectangleArea(int[] heights) {
        int area = 0;
        Stack<Integer> s = new Stack<>();

        for (int i = 0; i <= heights.length; i++) {
            while (!s.empty() && ( i == heights.length || heights[s.peek()] >= heights[i])) {
                int h = heights[s.peek()];
                s.pop();
                int w;

                if (s.empty())
                    w = i;
                else
                    w = i - s.peek() - 1;

                area = Math.max(area, w * h);
            }
            s.push(i);
        }

        return area;
    }

    public static void main(String[] a) {
        int[] heights = {2,1,5,6,2,3};

        LargestRectangleArea largestRectangleArea = new LargestRectangleArea();

        System.out.println(largestRectangleArea.largestRectangleArea(heights));
    }
}
